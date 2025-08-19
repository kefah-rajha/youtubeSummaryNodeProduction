"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet")); // Library for securing HTTP headers
const express_rate_limit_1 = __importDefault(require("express-rate-limit")); // Library for rate limiting requests
const cors_1 = __importDefault(require("cors")); // Library for enabling CORS
const morgan_1 = __importDefault(require("morgan")); // Library for logging HTTP requests
const dotenv_1 = __importDefault(require("dotenv")); // Library for loading environment variables
const mongoose_1 = __importDefault(require("mongoose"));
// import { clerkMiddleware } from '@clerk/express';
// import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
// import userWebHookRoutes from './routes/user.webHook.routes.js'
// import userRoute from './routes/user.routes.js'
// import checkoutRoute from "./routes/subscription.routes.js"
// import subscriptionRoute from "./routes/subscriptionTiers.routes.js"
// Increase max event listeners
// Load environment variables from .env file
dotenv_1.default.config();
// Create an Express application
const app = (0, express_1.default)();
// Enable CORS to allow requests from specific origins
app.use((0, cors_1.default)({
    origin: process.env.ALLOWED_ORIGINS || 'http://localhost:3000', // Specify allowed origins
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed HTTP methods
    credentials: true // Allow sending credentials (e.g., cookies)
}));
// Enable Helmet to secure HTTP headers
app.use((0, helmet_1.default)());
// app.use(clerkMiddleware());
// Set up rate limiting to prevent DDoS attacks
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15-minute window
    max: 100, // Maximum number of requests per IP in the window
    message: 'Too many requests, please try again later'
});
app.use(limiter);
// Enable Morgan for logging HTTP requests to the console
app.use((0, morgan_1.default)('combined'));
// Parse JSON request bodies
app.use(express_1.default.json());
// Parse URL-encoded request bodies
app.use(express_1.default.urlencoded({ extended: true }));
// Define the port for the server
const PORT = parseInt(process.env.PORT, 10) || 3000;
mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/YoutubeSummeriziation')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Failed to connect to MongoDB:', err));
// Define a root route for testing the application
app.get('/', (req, res) => {
    res.send('Hello! The application is running successfully');
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
