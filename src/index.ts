

import express, { Application, Request, Response } from 'express';
import helmet from 'helmet'; // Library for securing HTTP headers
import rateLimit from 'express-rate-limit'; // Library for rate limiting requests
import cors from 'cors'; // Library for enabling CORS
import morgan from 'morgan'; // Library for logging HTTP requests
import dotenv from 'dotenv'; // Library for loading environment variables
import mongoose from 'mongoose';
// import { clerkMiddleware } from '@clerk/express';

// import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
// import userWebHookRoutes from './routes/user.webHook.routes.js'
 import userRoute from './routes/user.routes'
 import checkoutRoute from "./routes/subscription.routes"
 import subscriptionRoute from "./routes/subscriptionTiers.routes"
// Increase max event listeners
// Load environment variables from .env file
dotenv.config();

// Create an Express application
const app: Application = express();

// Enable CORS to allow requests from specific origins
// app.use(cors({
//   origin: process.env.ALLOWED_ORIGINS || 'http://localhost:3000', // Specify allowed origins
//   methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed HTTP methods
//   credentials: true // Allow sending credentials (e.g., cookies)
// }));

app.use(cors({
 origin: '*', // مؤقتاً للاختبار
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Enable Helmet to secure HTTP headers
app.use(helmet());
// app.use(clerkMiddleware());

// Set up rate limiting to prevent DDoS attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15-minute window
  max: 100, // Maximum number of requests per IP in the window
  message: 'Too many requests, please try again later',
  validate: { trustProxy: false } // تعطيل تحذير trust proxy

});
app.use(limiter);

// Enable Morgan for logging HTTP requests to the console
app.use(morgan('combined'));

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// Define the port for the server
const PORT: number = parseInt(process.env.PORT as string, 10) || 5000;
// MongoDB connection
console.log('🔍 Environment Check:');
console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Provided' : 'Not provided');

if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch(err => {
      console.error('❌ MongoDB connection error:', err.message);
      console.log('⚠️ Application will run without database');
    });
} else {
  console.log('ℹ️ MONGODB_URI not provided, running without database');
}

// ✅ Routes - التأكد من أنهم مُعرّفين بشكل صحيح
app.get('/', (req: Request, res: Response) => {
  console.log('✅ Root endpoint called');
  res.status(200).json({
    success: true,
    message: 'YouTube Summary API Server is running! 🚀',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      api: '/api',
      status: '/status',
      root: '/'
    }
  });
});

// ✅ الـ route الأساسي - تأكد من المسار الصحيح
app.get('/api', (req: Request, res: Response) => {
  console.log('✅ /api endpoint called - this should work!');
  res.status(200).json({
    success: true,
    message: 'API endpoint is working correctly! 🎉',
    timestamp: new Date().toISOString(),
    database: process.env.MONGODB_URI ? 'configured' : 'not configured',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Setup routes
// setupRoutes(app);
 app.use('/api', userRoute);
 app.use('/api', checkoutRoute);
app.use('/api', subscriptionRoute);



// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});