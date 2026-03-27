# ParkFlow – Smart Parking Management System

Welcome to the **ParkFlow** project repository! ParkFlow is a comprehensive, modern Smart Parking Management System designed to handle vehicle entry/exit processing, automated billing, real-time analytics, electric vehicle (EV) charging queues, alerts, and more.

This project is built using a modern decoupled architecture:
- **Frontend**: Next.js 15 (React), Turbopack, Tailwind CSS
- **Backend**: Node.js, Express, Prisma ORM, TypeScript
- **Infrastructure**: PostgreSQL and Redis (containerized via Docker)

---

## Prerequisites

Before running this project on your local machine, ensure you have the following installed:
- **Node.js** (v18+)
- **npm** (v9+)
- **Docker Desktop** (or equivalent runtime for Docker Compose)
- **Git**

---

## 🚀 Local Deployment Setup

Follow these steps to set up the project locally.

### Step 1: Clone the Repository
Open your terminal and clone the repository (if you haven't already):
```bash
git clone <repository_url>
cd ParkFlow
```

### Step 2: Spin Up the Infrastructure
The system relies on Docker to host the database (PostgreSQL) and caching layer (Redis). Make sure Docker Desktop is open and running.

Run the following command from the root of the project to initialize the containers:
```bash
docker compose up -d
```
> **Note:** The backend is configured to look for the local PostgreSQL database on port `5430` and Redis on port `6370` as defined in the `docker-compose.yml`.

### Step 3: Backend Setup

Navigate to the `backend` directory:
```bash
cd backend
```

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Ensure there is a `.env` file in the `/backend` directory containing the following environment configurations:
   ```env
   PORT=8001
   DATABASE_URL="postgresql://postgres:postgres@localhost:5430/parkflow?schema=public"
   REDIS_URL="redis://localhost:6370"
   # Add any other required secrets here (JWT secret, etc.)
   ```

3. **Database Migration (Prisma):**
   Initialize the database schema:
   ```bash
   npx prisma migrate dev
   ```
   *(Optionally, if you have a seed script, run `npm run seed` or `npx prisma db seed` to populate initial data).*

4. **Start the Backend Server:**
   Start the development server:
   ```bash
   npm run dev
   ```
   The API will now be accessible at `http://localhost:8001`.

---

### Step 4: Frontend Setup

Open a **new terminal window/tab**, and navigate to the `frontend` directory starting from the root of the project:
```bash
cd frontend
```

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Ensure there is a `.env.local` file located in the `/frontend` directory pointing to the local API:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8001/api
   ```

3. **Start the Frontend Application:**
   Start the Next.js development server:
   ```bash
   npm run dev
   ```
   The web application will now be running at `http://localhost:3000`.

---

## 🛠️ Accessing the Application

Once both servers are running:
1. Open your web browser.
2. Navigate to **[http://localhost:3000](http://localhost:3000)**.
3. Use the authentication portal to log in or create an administrative account to access the dashboard.

## Overview of Modules

ParkFlow includes a full suite of administrative features designed to digitize parking lot operations:
- **Dashboard Hub**: High-level system health metrics, vehicle search, and active sessions tracking.
- **Entry & Exit Processing**: Check-in automation, manual overrides, and exit billing calculation.
- **Alerts & Security**: Real-time monitoring and anomaly detection for facility safety.
- **Analytics View**: Revenue trends, peak hour charts, and slot utilization metrics.
- **EV Charging Manager**: Waitlist queues, notification triggers, and idle fee calculation for EV stalls.
- **Slot Maintenance**: Toggle slot availability and manage bulk lot operations.
- **User & Loyalty Admin**: Control system access and apply discounts based on subscription tiers.
- **Swaps Marketplace**: Allow users to transfer their pre-booked reservations securely.
