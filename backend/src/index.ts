import dotenv from 'dotenv';
import { server } from './app';
import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 8001;

// Initialize Prisma client
export const prisma = new PrismaClient();

// Initialize Redis client
export const redisClient = createClient({
  url: process.env.REDIS_URL
});

async function startServer() {
  try {
    // Connect to database
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL database');

    // Connect to Redis (optional)
    try {
      await redisClient.connect();
      console.log('✅ Connected to Redis');
    } catch (error) {
      console.log('⚠️  Redis not available, continuing without caching');
    }

    // Start the server
    server.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📚 API available at: http://localhost:${PORT}/api`);
      console.log(`📖 API documentation available at: http://localhost:${PORT}/docs`);
      console.log(`❤️  Health check available at: http://localhost:${PORT}/health`);
      
      // Configuration validation
      try {
        console.log('\n🔧 Validating configuration...');
        validateConfig();
        console.log('✅ Configuration validation passed\n');
      } catch (error) {
        console.error('❌ Configuration validation failed:', error);
        console.warn('⚠️ Server will continue running with potentially invalid configuration');
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

function validateConfig() {
  const requiredEnvVars = ['DATABASE_URL'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
  
  console.log('Environment: NODE_ENV =', process.env.NODE_ENV || 'development');
  console.log('Database: DATABASE_URL is configured');
  console.log('Redis: REDIS_URL =', process.env.REDIS_URL || 'default connection');
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  await redisClient.quit();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  await redisClient.quit();
  process.exit(0);
});

startServer();