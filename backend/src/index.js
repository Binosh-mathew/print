// Environment configuration (must be first)
import dotenv from "dotenv";
dotenv.config();

// Core Node.js and Express modules
import express from "express";
import http from "http";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";

// Third-party libraries
import { Server } from "socket.io";

// Database connection
import { connectDB } from "./utils/dbConnect.js";

// Model imports (add this section)
import { Order } from "./models/Order.js";

// Middleware imports
import rateLimit from "./middleware/rateLimit.js";
import { verifySocketToken } from "./middleware/verifySocketToken.js";
import { maintenanceCheck } from "./middleware/maintenanceMode.js";

// Configuration imports
import { corsOptions } from "./config/cors.js";

// Utility imports
import { initScheduledTasks } from "./utils/scheduler.js";

// Route imports (alphabetically ordered)
import adsRoutes from "./routes/ads.js";
import adminsRoutes from "./routes/admins.js";
import authRoutes from "./routes/auth.js";
import loginAlertsRoutes from "./routes/loginAlerts.js";
import messagesRoutes from "./routes/messages.js";
import orderRoutes from "./routes/orders.js";
import platformStatsRoutes from "./routes/platformStats.js";
import productsRoutes from "./routes/products.js";
import storeRoutes from "./routes/stores.js";
import systemRoutes from "./routes/system.js";
import usersRoutes from "./routes/users.js";

// App initialization
const app = express();
const PORT = process.env.PORT || 5000; // Add fallback port

// Server and Socket.IO setup
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173", // Add fallback
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true, // Add compatibility with Socket.IO v2 clients
  pingTimeout: 30000,
  pingInterval: 25000
});

// Database connection (only once)
connectDB();

// Global middleware (order matters)
app.use(express.json());
app.use(cors(corsOptions));
app.use(morgan("dev"));
app.use(cookieParser());

// Initialize scheduled tasks
initScheduledTasks();

// Security headers
app.use((req, res, next) => {
  res.setHeader("Permissions-Policy", "fullscreen=*");
  next();
});

// Make Socket.IO instance available to routes (move before routes)
app.set("io", io);

// Public routes (no authentication required)
app.use("/api/auth", authRoutes);
app.use("/api/system", systemRoutes);
app.use("/api/platform-stats", platformStatsRoutes);

// Debug endpoint for Socket.IO - only available in dev mode
if (process.env.NODE_ENV === "development") {
  app.get("/api/socket-test", (req, res) => {
    const roomName = req.query.room || "all";
    const eventName = req.query.event || "test-event";
    const message = req.query.message || "Test message";
    
    console.log(`Broadcasting test message to ${roomName}: ${message}`);
    
    if (roomName === "all") {
      io.emit(eventName, { message, timestamp: new Date().toISOString() });
    } else {
      io.to(roomName).emit(eventName, { message, timestamp: new Date().toISOString() });
    }
    
    res.json({ 
      success: true, 
      message: `Test message sent to ${roomName}`,
      socketStats: {
        connections: io.engine.clientsCount,
        rooms: Array.from(io.sockets.adapter.rooms.keys())
          .filter(room => !room.startsWith('/'))
      }
    });
  });
}

// Public endpoint for fetching pending orders by store
app.get("/api/orders/pending-by-store", async (req, res) => {
  try {
    console.log("PUBLIC ENDPOINT: Fetching pending orders by store");

    // Get all pending orders (use imported model, not dynamic import)
    const pendingOrders = await Order.find({ status: "pending" }).lean(); // Use lowercase "pending"
    console.log(`Found ${pendingOrders.length} total pending orders`);

    // Group orders by storeId
    const pendingOrdersByStore = {};
    for (const order of pendingOrders) {
      if (order.storeId) {
        const storeId = order.storeId.toString();
        pendingOrdersByStore[storeId] =
          (pendingOrdersByStore[storeId] || 0) + 1;
      }
    }

    console.log("Pending orders by store:", pendingOrdersByStore);

    res.status(200).json({
      success: true,
      message: "Pending orders by store fetched successfully",
      data: pendingOrdersByStore, // Use 'data' for consistency
    });
  } catch (error) {
    console.error("Error in public pending orders endpoint:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching pending orders by store",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
});

// Maintenance mode check (applied after public routes)
app.use(maintenanceCheck);

// Rate limiting for specific endpoints
app.use(
  "/api/orders/:orderId",
  rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // 5 requests per minute
    message: "Too many requests for document access. Please try again later.",
  })
);

// Global rate limiting
app.use(rateLimit());

// Socket.IO authentication middleware
io.use(async (socket, next) => {
  try {
    console.log("Socket connection attempt - checking authentication");
    
    // Extract token from cookie or auth header
    const cookieToken = socket.handshake.headers.cookie
      ?.split(";")
      .find((c) => c.trim().startsWith("token="))
      ?.split("=")[1];
      
    const headerToken = socket.handshake.auth?.token || 
                        socket.handshake.headers?.authorization?.split(" ")[1];
    
    const token = cookieToken || headerToken;

    // If no token, proceed with limited access in development
    if (!token) {
      console.log("No token found for socket connection");
      if (process.env.NODE_ENV === "development") {
        socket.user = { id: "anonymous", role: "guest" };
        console.log("Development mode: allowing anonymous socket connection");
        return next();
      }
      return next(new Error("Authentication failed - no token"));
    }

    // Verify token
    const user = await verifySocketToken(token);
    if (!user) {
      console.log("Invalid token for socket connection");
      if (process.env.NODE_ENV === "development") {
        socket.user = { id: "anonymous", role: "guest" };
        console.log("Development mode: allowing socket connection despite invalid token");
        return next();
      }
      return next(new Error("Invalid token"));
    }

    socket.user = user;
    console.log(`Authenticated socket connection for user: ${user.id}`);
    next();
  } catch (error) {
    console.error("Socket authentication error:", error);
    if (process.env.NODE_ENV === "development") {
      socket.user = { id: "anonymous", role: "guest" };
      console.log("Development mode: allowing socket connection despite error");
      return next();
    }
    next(error);
  }
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  // Get user info or default to anonymous
  const { id: userId = "anonymous", role = "guest" } = socket.user || {};
  console.log(`Socket connected - ID: ${socket.id} (User: ${userId}, Role: ${role})`);

  // Join user-specific room
  socket.join(`user:${userId}`);

  // Join store-specific room for admins
  if (role === "admin") {
    socket.join(`store:${userId}`);
    console.log(`Admin user joined store room: store:${userId}`);
  }

  // Handle explicit store room joining
  socket.on("join-store", (storeId) => {
    if (!storeId) {
      console.warn(`Socket ${socket.id} attempted to join store with invalid storeId`);
      return;
    }
    
    socket.join(`store:${storeId}`);
    console.log(`Socket ${socket.id} joined store room: store:${storeId}`);
    socket.emit("joined-store", { storeId, message: "Connected to store updates" });
  });

  // Handle store room leaving
  socket.on("leave-store", (storeId) => {
    if (!storeId) {
      console.warn(`Socket ${socket.id} attempted to leave store with invalid storeId`);
      return;
    }
    
    socket.leave(`store:${storeId}`);
    console.log(`Socket ${socket.id} left store room: store:${storeId}`);
  });

  // Debug events
  socket.on("ping", (callback) => {
    console.log(`Received ping from socket ${socket.id}`);
    if (typeof callback === 'function') {
      callback({ status: 'pong', timestamp: new Date().toISOString() });
    } else {
      socket.emit('pong', { timestamp: new Date().toISOString() });
    }
  });

  socket.on("disconnect", (reason) => {
    console.log(`Socket disconnected - ID: ${socket.id}, Reason: ${reason}`);
  });

  socket.on("error", (error) => {
    console.error(`Socket error for ${socket.id}:`, error);
  });
});

// Protected routes (require authentication in production)
app.use("/api/ads", adsRoutes);
app.use("/api/admins", adminsRoutes);
app.use("/api/login-alerts", loginAlertsRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/users", usersRoutes);

// Global error handling middleware (must be last)
app.use((err, req, res, next) => {
  console.error("Error stack:", err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
});

// Start server
server.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
  console.log(` Socket.IO enabled - CORS origin: ${process.env.FRONTEND_URL || "http://localhost:5173"}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});
