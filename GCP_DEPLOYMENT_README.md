# ParkFlow - Google Cloud Platform Deployment Guide

This guide provides step-by-step instructions to deploy the ParkFlow parking management system on Google Cloud Platform (GCP).

## Project Architecture

ParkFlow is a full-stack parking management application with:
- **Backend**: Node.js/Express API with TypeScript, Prisma ORM
- **Frontend**: Next.js 15 React application
- **Database**: PostgreSQL
- **Cache**: Redis
- **Documentation**: Swagger/OpenAPI integration


## Prerequisites

1. **Google Cloud Account** with billing enabled
2. **Google Cloud CLI (gcloud)** installed and configured
3. **Docker** installed locally
4. **Node.js 20+** installed locally
5. **Git** for version control

## Step 1: Setup Google Cloud Project

### 1.1 Create a New Project
```bash
# Create a new GCP project
gcloud projects create parkflow-prod --name="ParkFlow Production"

# Set the project as active
gcloud config set project parkflow-prod

# Enable billing (replace BILLING_ACCOUNT_ID with your actual billing account)
gcloud billing projects link parkflow-prod --billing-account=BILLING_ACCOUNT_ID
```

### 1.2 Enable Required APIs
```bash
# Enable necessary GCP services
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable sql-component.googleapis.com
gcloud services enable redis.googleapis.com
gcloud services enable container.googleapis.com
gcloud services enable secretmanager.googleapis.com
gcloud services enable logging.googleapis.com
gcloud services enable monitoring.googleapis.com
```

## Step 2: Setup Database Services

### 2.1 Create Cloud SQL PostgreSQL Instance
```bash
# Create PostgreSQL instance
gcloud sql instances create parkflow-postgres \
    --database-version=POSTGRES_15 \
    --tier=db-f1-micro \
    --region=us-central1 \
    --root-password=secure_password_here \
    --storage-type=SSD \
    --storage-size=20GB

# Create database
gcloud sql databases create parkflow_db --instance=parkflow-postgres

# Create database user
gcloud sql users create parkflow_user \
    --instance=parkflow-postgres \
    --password=user_password_here
```

### 2.2 Create Redis Instance
```bash
# Create Redis instance
gcloud redis instances create parkflow-redis \
    --size=1 \
    --region=us-central1 \
    --redis-version=redis_7_0
```

## Step 3: Setup Secret Manager

### 3.1 Store Database Credentials
```bash
# Store database URL
echo "postgresql://parkflow_user:user_password_here@/parkflow_db?host=/cloudsql/parkflow-prod:us-central1:parkflow-postgres" | \
gcloud secrets create database-url --data-file=-

# Store JWT secret
echo "your-super-secure-jwt-secret-key" | \
gcloud secrets create jwt-secret --data-file=-

# Store Redis URL (get the actual IP from Redis instance)
REDIS_IP=$(gcloud redis instances describe parkflow-redis --region=us-central1 --format="value(host)")
echo "redis://${REDIS_IP}:6379" | \
gcloud secrets create redis-url --data-file=-
```

## Step 4: Prepare Application for Deployment

### 4.1 Create Backend Dockerfile for Production
Create `backend/Dockerfile.prod`:
```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build application
RUN npm run build

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S backend -u 1001

# Change ownership
RUN chown -R backend:nodejs /app
USER backend

EXPOSE 8080

# Start application
CMD ["npm", "start"]
```

### 4.2 Create Frontend Dockerfile
Create `frontend/Dockerfile`:
```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

RUN addgroup -g 1001 -S nodejs
RUN adduser -S frontend -u 1001

COPY --from=builder /app/public ./public
COPY --from=builder --chown=frontend:nodejs /app/.next/standalone ./
COPY --from=builder --chown=frontend:nodejs /app/.next/static ./.next/static

USER frontend

EXPOSE 3000

CMD ["node", "server.js"]
```

### 4.3 Update Frontend Configuration
Update `frontend/next.config.ts`:
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    outputFileTracingRoot: __dirname,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://parkflow-backend-url',
  },
};

export default nextConfig;
```

## Step 5: Deploy Backend to Cloud Run

### 5.1 Build and Deploy Backend
```bash
# Navigate to backend directory
cd backend

# Build and submit to Cloud Build
gcloud builds submit --tag gcr.io/parkflow-prod/backend

# Deploy to Cloud Run
gcloud run deploy parkflow-backend \
    --image gcr.io/parkflow-prod/backend \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --port 8080 \
    --memory 1Gi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 10 \
    --set-env-vars NODE_ENV=production \
    --set-env-vars PORT=8080 \
    --set-env-vars API_BASE_PATH="" \
    --set-secrets DATABASE_URL=database-url:latest \
    --set-secrets REDIS_URL=redis-url:latest \
    --set-secrets JWT_SECRET=jwt-secret:latest \
    --add-cloudsql-instances parkflow-prod:us-central1:parkflow-postgres
```

### 5.2 Run Database Migrations
```bash
# Get the backend service URL
BACKEND_URL=$(gcloud run services describe parkflow-backend --region=us-central1 --format="value(status.url)")

# Run migrations using Cloud Build
gcloud builds submit --config=migrate.yaml
```

Create `backend/migrate.yaml`:
```yaml
steps:
- name: 'gcr.io/parkflow-prod/backend'
  args: ['npx', 'prisma', 'migrate', 'deploy']
  env:
  - 'DATABASE_URL=${_DATABASE_URL}'
substitutions:
  _DATABASE_URL: 'postgresql://parkflow_user:user_password_here@/parkflow_db?host=/cloudsql/parkflow-prod:us-central1:parkflow-postgres'
```

## Step 6: Deploy Frontend to Cloud Run

### 6.1 Build and Deploy Frontend
```bash
# Navigate to frontend directory
cd ../frontend

# Build and submit to Cloud Build
gcloud builds submit --tag gcr.io/parkflow-prod/frontend

# Get backend URL for environment variable
BACKEND_URL=$(gcloud run services describe parkflow-backend --region=us-central1 --format="value(status.url)")

# Deploy frontend to Cloud Run
gcloud run deploy parkflow-frontend \
    --image gcr.io/parkflow-prod/frontend \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --port 3000 \
    --memory 512Mi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 5 \
    --set-env-vars NEXT_PUBLIC_API_URL=${BACKEND_URL}
```

## Step 7: Setup Load Balancer and Custom Domain (Optional)

### 7.1 Setup Global Load Balancer
```bash
# Reserve static IP
gcloud compute addresses create parkflow-ip --global

# Create backend service for frontend
gcloud compute backend-services create parkflow-frontend-backend \
    --protocol=HTTP \
    --port-name=http \
    --health-checks-region=us-central1 \
    --global

# Create URL map
gcloud compute url-maps create parkflow-lb \
    --default-service=parkflow-frontend-backend

# Create HTTP(S) proxy
gcloud compute target-http-proxies create parkflow-http-proxy \
    --url-map=parkflow-lb

# Create forwarding rule
gcloud compute forwarding-rules create parkflow-http-rule \
    --global \
    --target-http-proxy=parkflow-http-proxy \
    --ports=80
```

### 7.2 Setup Custom Domain
```bash
# Get the static IP
STATIC_IP=$(gcloud compute addresses describe parkflow-ip --global --format="value(address)")

echo "Configure your domain DNS A record to point to: $STATIC_IP"

# Setup SSL certificate (replace with your domain)
gcloud compute ssl-certificates create parkflow-ssl \
    --domains=yourdomain.com,www.yourdomain.com
```

## Step 8: Setup Monitoring and Logging

### 8.1 Enable Monitoring
```bash
# Create notification channel (replace with your email)
gcloud alpha monitoring channels create \
    --display-name="ParkFlow Alerts" \
    --type=email \
    --channel-labels=email_address=your-email@example.com

# Create uptime check
gcloud monitoring uptime-check-configs create \
    --display-name="ParkFlow Frontend Check" \
    --http-check-path="/" \
    --http-check-port=443 \
    --monitored-resource-type="uptime_url" \
    --hostname="yourdomain.com"
```

## Step 9: Environment Variables and Configuration

### 9.1 Backend Environment Variables
Set these in Cloud Run for the backend service:
- `NODE_ENV=production`
- `PORT=8080`
- `API_BASE_PATH=""`
- `DATABASE_URL` (from Secret Manager)
- `REDIS_URL` (from Secret Manager)
- `JWT_SECRET` (from Secret Manager)

### 9.2 Frontend Environment Variables
Set these in Cloud Run for the frontend service:
- `NEXT_PUBLIC_API_URL=<backend-cloud-run-url>`

## Step 10: Testing the Deployment

### 10.1 Test Backend API
```bash
# Get backend URL
BACKEND_URL=$(gcloud run services describe parkflow-backend --region=us-central1 --format="value(status.url)")

# Test health endpoint
curl ${BACKEND_URL}/health

# Test API documentation
curl ${BACKEND_URL}/docs
```

### 10.2 Test Frontend
```bash
# Get frontend URL
FRONTEND_URL=$(gcloud run services describe parkflow-frontend --region=us-central1 --format="value(status.url)")

# Test frontend
curl ${FRONTEND_URL}
```

## Step 11: Maintenance and Updates

### 11.1 Deploy Updates
```bash
# For backend updates
cd backend
gcloud builds submit --tag gcr.io/parkflow-prod/backend
gcloud run deploy parkflow-backend --image gcr.io/parkflow-prod/backend --region us-central1

# For frontend updates
cd frontend
gcloud builds submit --tag gcr.io/parkflow-prod/frontend
gcloud run deploy parkflow-frontend --image gcr.io/parkflow-prod/frontend --region us-central1
```

### 11.2 Database Migrations
```bash
# Run new migrations
gcloud builds submit --config=migrate.yaml
```

## Security Considerations

1. **Use IAM roles** with least privilege principle
2. **Enable VPC** for internal communication
3. **Use Secret Manager** for all sensitive data
4. **Enable Cloud Armor** for DDoS protection
5. **Regular security updates** for dependencies
6. **Monitor access logs** and set up alerts

## Cost Optimization

1. **Set appropriate min/max instances** based on traffic
2. **Use smaller machine types** for development
3. **Enable autoscaling** for Cloud Run services
4. **Monitor billing** and set up budget alerts
5. **Use Cloud Scheduler** for periodic tasks

## Troubleshooting

### Common Issues:
1. **Cloud SQL connection issues**: Check VPC connectivity and firewall rules
2. **Out of memory errors**: Increase memory allocation in Cloud Run
3. **Cold start delays**: Set minimum instances > 0 for production
4. **CORS issues**: Ensure frontend URL is configured correctly in backend

### Useful Commands:
```bash
# View logs
gcloud logs read "resource.type=cloud_run_revision AND resource.labels.service_name=parkflow-backend"

# Check service status
gcloud run services describe parkflow-backend --region=us-central1

# Update environment variables
gcloud run services update parkflow-backend --set-env-vars NEW_VAR=value --region=us-central1
```

## Support

For issues with this deployment guide or the ParkFlow application, please refer to the project documentation or create an issue in the project repository.