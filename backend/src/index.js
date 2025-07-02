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
const PORT = process.env.PORT;

// Server and Socket.IO setup
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
});

// Database connection
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

// Socket.IO authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.headers.cookie
      ?.split(";")
      .find((c) => c.trim().startsWith("token="))
      ?.split("=")[1];

    if (!token) return next(new Error("Authentication failed"));

    const user = await verifySocketToken(token);
    if (!user) return next(new Error("Invalid token"));

    socket.user = user;
    next();
  } catch (error) {
    next(error);
  }
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  const { id: userId, role } = socket.user;
  console.log(`Socket connected - ID: ${socket.id} (User: ${userId})`);

  // Join user-specific room
  socket.join(`user:${userId}`);

  // Join store-specific room for admins
  if (role === "admin") {
    socket.join(`store:${userId}`);
  }

  socket.on("disconnect", () => {
    console.log(`Socket disconnected - ID: ${socket.id}`);
  });
});

// Make Socket.IO instance available to routes
app.set("io", io);

// Public routes (no authentication required)
app.use("/api/auth", authRoutes);
app.use("/api/system", systemRoutes);
app.use("/api/platform-stats", platformStatsRoutes);

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
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.IO enabled`);
});
