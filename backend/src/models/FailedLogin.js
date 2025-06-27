import mongoose from "mongoose";

const failedLoginSchema = new mongoose.Schema({
  email: String,
  ipAddress: String,
  attemptCount: { type: Number, default: 1 },
  lastAttempt: { type: Date, default: Date.now },
  isResolved: { type: Boolean, default: false },
  userRole: { type: String, default: "unknown" },
});

export const FailedLogin = mongoose.model('FailedLogin', failedLoginSchema);
