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
import adminsRoutes from "./routes/admins.js";
import messagesRoutes from "./routes/messages.js";
import usersRoutes from "./routes/users.js";
import systemRoutes from "./routes/system.js";
import productsRoutes from "./routes/products.js";
import adsRoutes from "./routes/ads.js";
import loginAlertsRoutes from "./routes/loginAlerts.js";
import {maintenanceCheck} from "./middleware/maintenanceMode.js";
import { corsOptions } from "./config/cors.js";
import { initScheduledTasks } from "./utils/scheduler.js";


const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(express.json());
app.use(cors(corsOptions));
app.use(morgan("dev"));
app.use(cookieParser());
initScheduledTasks(); // Initialize scheduled tasks
app.use(rateLimit()); // Apply rate limiting middleware

// Add permissions policy header to allow fullscreen
app.use((req, res, next) => {
  res.setHeader("Permissions-Policy", "fullscreen=*");
  next();
});

// Connect to MongoDB
connectDB();

// Separate public endpoint for fetching pending orders by store
app.get("/api/orders/pending-by-store", async (req, res) => {
  try {
    console.log("PUBLIC ENDPOINT: Fetching pending orders by store");
    
    // Import Order model specifically for this route to avoid circular dependencies
    const { Order } = await import("./models/Order.js");
    
    // Get all pending orders
    const pendingOrders = await Order.find({ status: "Pending" }).lean();
    console.log(`Found ${pendingOrders.length} total pending orders`);
    
    // Count manually by storeId
    const pendingOrdersByStore = {};
    for (const order of pendingOrders) {
      if (order.storeId) {
        const storeId = order.storeId.toString(); // Ensure it's a string
        pendingOrdersByStore[storeId] = (pendingOrdersByStore[storeId] || 0) + 1;
      }
    }
    
    // Log counts for debugging
    console.log("Pending orders by store:", pendingOrdersByStore);
    
    res.status(200).json({
      success: true,
      message: "Pending orders by store fetched successfully",
      pendingOrdersByStore
    });
  } catch (error) {
    console.error("Error in public pending orders endpoint:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching pending orders by store",
      error: error.message
    });
  }
});

// Use routes without requiring authentication for development
app.use("/api/auth", authRoutes);
app.use("/api/system", systemRoutes);
app.use("/api/platform-stats", platformStatsRoutes);

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
// Note: Our public pending-orders endpoint is defined before this, so it won't be affected by auth middleware
app.use("/api/orders", orderRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/admins", adminsRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/ads", adsRoutes);
app.use("/api/login-alerts", loginAlertsRoutes);


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
