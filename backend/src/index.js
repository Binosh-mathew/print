import dotenv from "dotenv";
dotenv.config();


//Import necessary modules
import express from "express";
import cors from "cors";
import morgan from "morgan";
import  cookieParser  from "cookie-parser"
import {connectDB} from "./utils/dbConnect.js";

// Simple rate limiting middleware
const rateLimit = (options = {}) => {
  const {
    windowMs = 60 * 1000, // 1 minute
    max = 45,            // Limit each IP to 45 requests per windowMs
    message = "Too many requests, please try again later.",
    statusCode = 429,
    standardHeaders = true,   // Send standard rate limit headers with limit info
  } = options;
  
  const requests = new Map();
  
  // Return middleware function
  return (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();
    
    // Clean up old entries
    if (!requests.has(ip)) {
      requests.set(ip, []);
    }
    
    const ipRequests = requests.get(ip).filter(time => now - time < windowMs);
    requests.set(ip, ipRequests);
    
    // Check if the IP has reached the limit
    if (ipRequests.length >= max) {
      if (standardHeaders) {
        res.setHeader('Retry-After', Math.ceil(windowMs / 1000));
        res.setHeader('X-RateLimit-Limit', max);
        res.setHeader('X-RateLimit-Remaining', Math.max(0, max - ipRequests.length));
      }
      return res.status(statusCode).json({ message });
    }
    
    // Add the current request to the list
    ipRequests.push(now);
    requests.set(ip, ipRequests);
    
    next();
  };
};

// Import routes
import authRoutes from "./routes/auth.js";
import orderRoutes from "./routes/orders.js";
import storeRoutes from "./routes/stores.js";
import platformStatsRoutes from "./routes/platformStats.js";
import loginActivityRoutes from "./routes/loginActivity.js";
import adminsRoutes from "./routes/admins.js";
import messagesRoutes from "./routes/messages.js";
import usersRoutes from "./routes/users.js";
import systemRoutes from "./routes/system.js";
import {maintenanceCheck} from "./middleware/maintenanceMode.js";


const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true, 
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "X-User-ID",
    "X-User-Role"
  ],
  exposedHeaders: ['set-cookie'],
}));
app.use(morgan("dev"));
app.use(cookieParser());
app.use(rateLimit()); // Apply rate limiting middleware

// Add permissions policy header to allow fullscreen
app.use((req, res, next) => {
  res.setHeader('Permissions-Policy', 'fullscreen=*');
  next();
});

// Connect to MongoDB
connectDB();



// Use routes without requiring authentication for development
app.use("/api/auth", authRoutes);
app.use("/api/system", systemRoutes);
app.use("/api/platform-stats", platformStatsRoutes);
app.use("/api/login-activity", loginActivityRoutes);

// Apply maintenance mode check without requiring authentication
app.use(maintenanceCheck);

// Apply rate limiting to specific routes
// More strict rate limiting for document routes that might fetch large files
app.use("/api/orders/:orderId", rateLimit({
  windowMs: 60 * 1000,    // 1 minute window
  max: 5,                 // Limit each IP to 5 requests per minute for specific order endpoints
  message: "Too many requests for document access. Please try again later."
}));

// Routes that should require authentication in production
app.use("/api/orders", orderRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/admins", adminsRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/users", usersRoutes);

// Routes
app.get("/", (req, res) => {
  res.send("Welcome to the Print Shop Backend");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ message: "Something went wrong!", error: err.message });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
