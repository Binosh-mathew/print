export const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:8080",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "X-User-ID",
    "X-User-Role",
  ],
  exposedHeaders: ["set-cookie"],
};