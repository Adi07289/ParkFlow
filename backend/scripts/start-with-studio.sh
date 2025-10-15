#!/bin/bash

# Start with Studio - Run backend API and Prisma Studio concurrently
echo "🚀 Starting ParkFlow Backend with Prisma Studio..."

# Function to handle cleanup on script termination
cleanup() {
    echo "🛑 Shutting down services..."
    jobs -p | xargs -r kill
    exit 0
}

# Trap INT and TERM signals to cleanup background processes
trap cleanup INT TERM

# Run Prisma migrations first
echo "📦 Running Prisma migrations..."
npx prisma migrate deploy

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

echo "🎯 Starting Backend API on port 8001..."
npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

echo "🎨 Starting Prisma Studio on port 5555..."
npx prisma studio --port 5555 --hostname 0.0.0.0 &
STUDIO_PID=$!

echo "✅ Services started successfully!"
echo "📊 Backend API: http://localhost:8001"
echo "🎨 Prisma Studio: http://localhost:5555"
echo "📖 API Documentation: http://localhost:8001/docs"
echo ""
echo "💡 Press Ctrl+C to stop all services"

# Wait for both processes
wait $BACKEND_PID $STUDIO_PID