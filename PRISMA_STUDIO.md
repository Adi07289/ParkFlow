# Prisma Studio Setup

This document explains how to run Prisma Studio with the ParkFlow backend in various ways.

## 🐳 Docker Setup (Recommended)

Prisma Studio is automatically configured to run with Docker Compose.

### Starting with Docker Compose

```bash
# Start all services including Prisma Studio
docker-compose up -d

# View logs
docker-compose logs -f prisma-studio
```

### Accessing Prisma Studio

Once Docker is running, Prisma Studio will be available at:
- **URL**: http://localhost:5555
- **Container**: `ParkFlow_prisma_studio`

## 💻 Local Development

### Option 1: Run Backend + Studio Together

```bash
cd backend
npm install
npm run dev:studio
```

This will start:
- Backend API on port 8001
- Prisma Studio on port 5555

### Option 2: Run Studio Separately

```bash
cd backend
npm install
npm run studio
# or
npm run prisma:studio
```

### Option 3: Using the Custom Script

```bash
cd backend
chmod +x scripts/start-with-studio.sh
./scripts/start-with-studio.sh
```

## 🔧 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Run backend only |
| `npm run dev:studio` | Run backend + Prisma Studio concurrently |
| `npm run studio` | Run Prisma Studio only |
| `npm run prisma:studio` | Run Prisma Studio only (alternative) |

## 📊 Service URLs

When running with Docker Compose:

- **Backend API**: http://localhost:8001
- **Prisma Studio**: http://localhost:5555  
- **API Documentation**: http://localhost:8001/docs
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## 🛠️ Docker Services

The setup includes these services:

```yaml
services:
  postgres:       # Database
  redis:          # Cache
  backend:        # API Server (port 8001)
  prisma-studio:  # Database UI (port 5555)
```

## 🔍 Troubleshooting

### Prisma Studio not accessible

1. Check if the service is running:
   ```bash
   docker-compose ps prisma-studio
   ```

2. Check logs:
   ```bash
   docker-compose logs prisma-studio
   ```

3. Restart the service:
   ```bash
   docker-compose restart prisma-studio
   ```

### Database connection issues

Make sure PostgreSQL is running and healthy:
```bash
docker-compose ps postgres
docker-compose logs postgres
```

### Port conflicts

If port 5555 is in use, you can change it in `docker-compose.yml`:
```yaml
prisma-studio:
  ports:
    - "5556:5555"  # Change external port
```

## 🚀 Quick Start

1. **Start everything:**
   ```bash
   docker-compose up -d
   ```

2. **Access Prisma Studio:**
   Open http://localhost:5555 in your browser

3. **View your database:**
   Browse tables, edit data, run queries

4. **Stop services:**
   ```bash
   docker-compose down
   ```

## 📝 Notes

- Prisma Studio runs in a separate container for better isolation
- Both backend and studio share the same database connection
- Studio automatically generates the Prisma client on startup
- All database changes in Studio are immediately reflected in the API