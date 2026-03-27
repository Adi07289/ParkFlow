#!/bin/bash

# ParkFlow AWS Deployment Script for Existing EC2 Instance
# This script deploys your Node.js backend to an existing EC2 instance with RDS PostgreSQL

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️  $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ❌ $1${NC}"
    exit 1
}

# Configuration - UPDATE THESE VALUES
AWS_REGION="${AWS_REGION:-us-east-1}"
PROJECT_NAME="parkflow"
DB_NAME="parkflow_db"
DB_USERNAME="parkflow_user"
EC2_PUBLIC_IP="${EC2_PUBLIC_IP}"
SSH_KEY_PATH="${SSH_KEY_PATH}"
GITHUB_REPO_URL="${GITHUB_REPO_URL}"

# Validate required environment variables
if [ -z "$EC2_PUBLIC_IP" ]; then
    error "Please set EC2_PUBLIC_IP environment variable"
fi

if [ -z "$SSH_KEY_PATH" ]; then
    error "Please set SSH_KEY_PATH environment variable (path to your .pem file)"
fi

if [ -z "$GITHUB_REPO_URL" ]; then
    warning "GITHUB_REPO_URL not set. You'll need to upload code manually."
fi

# Generate random password for database
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)

log "Starting ParkFlow deployment to existing EC2 instance..."
log "EC2 IP: $EC2_PUBLIC_IP"
log "AWS Region: $AWS_REGION"

# Step 1: Create RDS PostgreSQL Database (Free Tier)
create_rds_database() {
    log "Creating RDS PostgreSQL database (Free Tier)..."
    
    # Create DB Subnet Group
    log "Creating DB subnet group..."
    VPC_ID=$(aws ec2 describe-instances \
        --filters "Name=instance-state-name,Values=running" \
        --query "Reservations[0].Instances[0].VpcId" \
        --output text \
        --region $AWS_REGION)
    
    SUBNET_IDS=$(aws ec2 describe-subnets \
        --filters "Name=vpc-id,Values=$VPC_ID" \
        --query "Subnets[*].SubnetId" \
        --output text \
        --region $AWS_REGION)
    
    # Convert space-separated to comma-separated
    SUBNET_IDS_ARRAY=($SUBNET_IDS)
    
    aws rds create-db-subnet-group \
        --db-subnet-group-name "${PROJECT_NAME}-subnet-group" \
        --db-subnet-group-description "Subnet group for ParkFlow DB" \
        --subnet-ids ${SUBNET_IDS_ARRAY[@]} \
        --region $AWS_REGION || warning "DB subnet group might already exist"
    
    # Create Security Group for RDS
    log "Creating security group for RDS..."
    RDS_SG_ID=$(aws ec2 create-security-group \
        --group-name "${PROJECT_NAME}-rds-sg" \
        --description "Security group for ParkFlow RDS" \
        --vpc-id $VPC_ID \
        --query 'GroupId' \
        --output text \
        --region $AWS_REGION 2>/dev/null || \
        aws ec2 describe-security-groups \
        --filters "Name=group-name,Values=${PROJECT_NAME}-rds-sg" \
        --query 'SecurityGroups[0].GroupId' \
        --output text \
        --region $AWS_REGION)
    
    # Allow PostgreSQL access from EC2
    EC2_SG_ID=$(aws ec2 describe-instances \
        --filters "Name=instance-state-name,Values=running" \
        --query "Reservations[0].Instances[0].SecurityGroups[0].GroupId" \
        --output text \
        --region $AWS_REGION)
    
    aws ec2 authorize-security-group-ingress \
        --group-id $RDS_SG_ID \
        --protocol tcp \
        --port 5432 \
        --source-group $EC2_SG_ID \
        --region $AWS_REGION 2>/dev/null || warning "Security group rule might already exist"
    
    # Create RDS Instance (Free Tier)
    log "Creating RDS PostgreSQL instance (this may take 5-10 minutes)..."
    aws rds create-db-instance \
        --db-instance-identifier "${PROJECT_NAME}-postgres" \
        --db-instance-class db.t3.micro \
        --engine postgres \
        --engine-version 13.13 \
        --master-username $DB_USERNAME \
        --master-user-password $DB_PASSWORD \
        --allocated-storage 20 \
        --db-name $DB_NAME \
        --vpc-security-group-ids $RDS_SG_ID \
        --db-subnet-group-name "${PROJECT_NAME}-subnet-group" \
        --no-multi-az \
        --no-publicly-accessible \
        --storage-type gp2 \
        --backup-retention-period 1 \
        --region $AWS_REGION || warning "RDS instance might already exist"
    
    # Wait for RDS to be available
    log "Waiting for RDS instance to be available..."
    aws rds wait db-instance-available \
        --db-instance-identifier "${PROJECT_NAME}-postgres" \
        --region $AWS_REGION
    
    # Get RDS endpoint
    DB_ENDPOINT=$(aws rds describe-db-instances \
        --db-instance-identifier "${PROJECT_NAME}-postgres" \
        --query "DBInstances[0].Endpoint.Address" \
        --output text \
        --region $AWS_REGION)
    
    success "RDS PostgreSQL created successfully!"
    success "Database endpoint: $DB_ENDPOINT"
}

# Step 2: Deploy application to EC2
deploy_to_ec2() {
    log "Deploying application to EC2 instance..."
    
    # Generate JWT secret
    JWT_SECRET=$(openssl rand -base64 64 | tr -d "\n")
    
    # Create DATABASE_URL
    DATABASE_URL="postgresql://${DB_USERNAME}:${DB_PASSWORD}@${DB_ENDPOINT}:5432/${DB_NAME}?schema=public"
    
    # Create deployment script for EC2
    cat > ec2_deploy_script.sh << 'EOF'
#!/bin/bash

set -e

log() {
    echo "[$(date)] $1"
}

# Update system
log "Updating system packages..."
sudo yum update -y

# Install Node.js 20
log "Installing Node.js 20..."
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs

# Install Git
log "Installing Git..."
sudo yum install -y git

# Install PostgreSQL client
log "Installing PostgreSQL client..."
sudo yum install -y postgresql15

# Install PM2 globally
log "Installing PM2..."
sudo npm install -g pm2

# Create application directory
log "Setting up application directory..."
sudo mkdir -p /opt/parkflow
sudo chown ec2-user:ec2-user /opt/parkflow
cd /opt/parkflow

# Clone repository or setup for manual upload
if [ ! -z "$GITHUB_REPO_URL" ]; then
    log "Cloning repository from $GITHUB_REPO_URL..."
    git clone $GITHUB_REPO_URL .
else
    log "Repository URL not provided. Please upload your code manually to /opt/parkflow"
    log "You can use: scp -i your-key.pem -r ./backend/* ec2-user@$EC2_PUBLIC_IP:/opt/parkflow/"
fi

# Create .env file
log "Creating environment configuration..."
cat > .env << ENVEOF
NODE_ENV=production
PORT=8001
DATABASE_URL=$DATABASE_URL
JWT_SECRET=$JWT_SECRET
API_BASE_PATH=""
REDIS_URL=""
ENVEOF

# Install dependencies
if [ -f "package.json" ]; then
    log "Installing npm dependencies..."
    npm install --production
    
    # Build application if build script exists
    if npm run | grep -q "build"; then
        log "Building application..."
        npm run build
    fi
    
    # Generate Prisma client
    log "Generating Prisma client..."
    npx prisma generate
    
    # Run database migrations
    log "Running database migrations..."
    npx prisma migrate deploy
    
    # Start application with PM2
    log "Starting application with PM2..."
    cd backend 2>/dev/null || true
    pm2 start dist/index.js --name "parkflow-backend" --env production
    
    # Save PM2 configuration
    pm2 save
    
    # Setup PM2 to start on boot
    pm2 startup
    sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ec2-user --hp /home/ec2-user
    
    log "Application deployed successfully!"
    log "Backend is running on port 8001"
    log "PM2 status:"
    pm2 status
else
    log "package.json not found. Please upload your application code first."
fi
EOF
    
    # Make script executable
    chmod +x ec2_deploy_script.sh
    
    # Copy environment variables to script
    sed -i "s|\$DATABASE_URL|$DATABASE_URL|g" ec2_deploy_script.sh
    sed -i "s|\$JWT_SECRET|$JWT_SECRET|g" ec2_deploy_script.sh
    sed -i "s|\$GITHUB_REPO_URL|$GITHUB_REPO_URL|g" ec2_deploy_script.sh
    sed -i "s|\$EC2_PUBLIC_IP|$EC2_PUBLIC_IP|g" ec2_deploy_script.sh
    
    # Copy script to EC2 and execute
    log "Copying deployment script to EC2..."
    scp -i "$SSH_KEY_PATH" -o StrictHostKeyChecking=no ec2_deploy_script.sh ec2-user@$EC2_PUBLIC_IP:/tmp/
    
    log "Executing deployment on EC2..."
    ssh -i "$SSH_KEY_PATH" -o StrictHostKeyChecking=no ec2-user@$EC2_PUBLIC_IP "chmod +x /tmp/ec2_deploy_script.sh && /tmp/ec2_deploy_script.sh"
    
    success "Application deployed to EC2!"
}

# Step 3: Update EC2 Security Group to allow HTTP traffic
update_security_group() {
    log "Updating EC2 security group to allow HTTP traffic..."
    
    INSTANCE_ID=$(aws ec2 describe-instances \
        --filters "Name=ip-address,Values=$EC2_PUBLIC_IP" "Name=instance-state-name,Values=running" \
        --query "Reservations[0].Instances[0].InstanceId" \
        --output text \
        --region $AWS_REGION)
    
    SECURITY_GROUP_ID=$(aws ec2 describe-instances \
        --instance-ids $INSTANCE_ID \
        --query "Reservations[0].Instances[0].SecurityGroups[0].GroupId" \
        --output text \
        --region $AWS_REGION)
    
    # Allow HTTP traffic on port 8001
    aws ec2 authorize-security-group-ingress \
        --group-id $SECURITY_GROUP_ID \
        --protocol tcp \
        --port 8001 \
        --cidr 0.0.0.0/0 \
        --region $AWS_REGION 2>/dev/null || warning "Port 8001 might already be open"
    
    success "Security group updated to allow traffic on port 8001"
}

# Main deployment function
main() {
    log "Checking AWS CLI configuration..."
    aws sts get-caller-identity > /dev/null || error "AWS CLI not configured properly"
    
    log "Checking SSH connectivity to EC2..."
    ssh -i "$SSH_KEY_PATH" -o StrictHostKeyChecking=no -o ConnectTimeout=10 ec2-user@$EC2_PUBLIC_IP "echo 'SSH connection successful'" || error "Cannot connect to EC2 instance"
    
    create_rds_database
    deploy_to_ec2
    update_security_group
    
    success "🎉 Deployment completed successfully!"
    echo ""
    echo "📋 Deployment Summary:"
    echo "🌐 Backend URL: http://$EC2_PUBLIC_IP:8001"
    echo "🔗 API Health: http://$EC2_PUBLIC_IP:8001/health"
    echo "📖 API Docs: http://$EC2_PUBLIC_IP:8001/docs"
    echo "💾 Database: PostgreSQL on RDS (Free Tier)"
    echo ""
    echo "🔧 Management Commands:"
    echo "SSH to EC2: ssh -i $SSH_KEY_PATH ec2-user@$EC2_PUBLIC_IP"
    echo "Check PM2: pm2 status"
    echo "View logs: pm2 logs parkflow-backend"
    echo "Restart app: pm2 restart parkflow-backend"
}

# Handle command line arguments
case "${1:-}" in
    "rds-only")
        create_rds_database
        ;;
    "deploy-only")
        deploy_to_ec2
        ;;
    "security-only")
        update_security_group
        ;;
    *)
        main
        ;;
esac