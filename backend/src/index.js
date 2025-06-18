import dotenv from "dotenv";
dotenv.config();


//Import necessary modules
import express from "express";
import cors from "cors";
import morgan from "morgan";
import  cookieParser  from "cookie-parser"
import {connectDB} from "./utils/dbConnect.js";

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

// Connect to MongoDB
connectDB();



// Use routes without requiring authentication for development
app.use("/api/auth", authRoutes);
app.use("/api/system", systemRoutes);
app.use("/api/platform-stats", platformStatsRoutes);
app.use("/api/login-activity", loginActivityRoutes);

// Apply maintenance mode check without requiring authentication
app.use(maintenanceCheck);

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
