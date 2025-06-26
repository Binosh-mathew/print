import dotenv from "dotenv";
dotenv.config();


//Import necessary modules
import express from "express";
import cors from "cors";
import morgan from "morgan";
import  cookieParser  from "cookie-parser"
import {connectDB} from "./utils/dbConnect.js";
import rateLimit from "./middleware/rateLimit.js"



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
import productsRoutes from "./routes/products.js";
import adsRoutes from "./routes/ads.js";
import {maintenanceCheck} from "./middleware/maintenanceMode.js";
import { corsOptions } from "./config/cors.js";


const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(express.json());
app.use(cors(corsOptions));
app.use(morgan("dev"));
app.use(cookieParser());
app.use(rateLimit()); // Apply rate limiting middleware

// Add permissions policy header to allow fullscreen
app.use((req, res, next) => {
  res.setHeader("Permissions-Policy", "fullscreen=*");
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
app.use("/api/products", productsRoutes);
app.use("/api/ads", adsRoutes);


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
