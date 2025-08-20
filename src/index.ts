

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
// import userRoute from './routes/user.routes.js'
// import checkoutRoute from "./routes/subscription.routes.js"
// import subscriptionRoute from "./routes/subscriptionTiers.routes.js"
// Increase max event listeners
// Load environment variables from .env file
dotenv.config();

// Create an Express application
const app: Application = express();

// Enable CORS to allow requests from specific origins
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS || 'http://localhost:3000', // Specify allowed origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed HTTP methods
  credentials: true // Allow sending credentials (e.g., cookies)
}));

// Enable Helmet to secure HTTP headers
app.use(helmet());
// app.use(clerkMiddleware());

// Set up rate limiting to prevent DDoS attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15-minute window
  max: 100, // Maximum number of requests per IP in the window
  message: 'Too many requests, please try again later'
});
app.use(limiter);

// Enable Morgan for logging HTTP requests to the console
app.use(morgan('combined'));

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// Define the port for the server
const PORT: number = parseInt(process.env.PORT as string, 10) || 3000;
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/YoutubeSummeriziation')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Failed to connect to MongoDB:', err));

// Define a root route for testing the application
app.get('/', (req: Request, res: Response) => {
   return res.status(200).json({
    success:"true"
   })
});

// Setup routes
// setupRoutes(app);
// app.use('/api', userRoute);
// app.use('/api', checkoutRoute);
// app.use('/api', subscriptionRoute);



// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});