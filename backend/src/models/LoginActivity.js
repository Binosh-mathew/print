import mongoose from "mongoose";

const loginActivitySchema = new mongoose.Schema({
  userName: String,
  userRole: String,
  timestamp: { type: Date, default: Date.now },
  ipAddress: String,
  action: String
});

export const LoginActivity = mongoose.model('LoginActivity', loginActivitySchema);
