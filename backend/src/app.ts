import express from 'express';
import http from 'http';
import cors from 'cors';
// import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { RegisterRoutes } from './routes/routes';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
// import { otpRateLimit, authRateLimit } from './middleware/rateLimitMiddleware';
import { authMiddleware, AuthRequest } from './middleware/authMiddleware';
import { setupDocumentation, protectDocumentation } from './middleware/documentation';

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 8001;

export { app };

// Setup documentation BEFORE security middleware
setupDocumentation(app);

// Security middleware disabled for now
// app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL || "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002"
  ],
  credentials: true,
  optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
};

app.use(cors(corsOptions));

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware with error handling
app.use(express.json({ 
  limit: '10mb',
  type: 'application/json'
}));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// JSON parsing error handler (must be after express.json())
app.use((err: any, req: any, res: any, next: any): void => {
  if (err instanceof SyntaxError && 'body' in err && err.message.includes('JSON')) {
    res.status(400).json({ error: 'Invalid JSON', message: 'Request body contains malformed JSON' });
    return;
  }
  next(err);
});

// Documentation protection middleware (blocks /docs in production unless enabled)
app.use(protectDocumentation());

// Rate limiting disabled for development
// app.use('/api/auth/send-register-otp', otpRateLimit);
// app.use('/api/auth/send-login-otp', otpRateLimit);
// app.use('/api/auth', authRateLimit);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Register tsoa routes
RegisterRoutes(app);

// Root route
app.get("/", (req, res): void => {
  res.send("Hello from the backend!");
});

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Global error handler
app.use((err: any, req: any, res: any, next: any): void => {
  console.error('Global error handler:', err);
  
  // Handle specific error types
  if (err.name === 'ValidationError' || err.name === 'ZodError') {
    res.status(400).json({ error: 'Validation error', details: err.message });
  } else if (err.name === 'UnauthorizedError' || err.message?.includes('Authentication')) {
    res.status(401).json({ error: 'Unauthorized', message: err.message });
  } else if (err.name === 'ForbiddenError' || err.message?.includes('Forbidden')) {
    res.status(403).json({ error: 'Forbidden', message: err.message });
  } else if (err.code?.startsWith('P')) { // Prisma errors
    res.status(400).json({ error: 'Database error', message: 'Invalid data provided' });
  } else {
    // Generic server error
    res.status(500).json({ 
      error: 'Internal server error', 
      message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
  }
});

// Export server for use in index.ts
export { server };