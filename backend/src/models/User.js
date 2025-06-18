import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin", "developer"],
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    authProvider: {
      type: String,
      enum: ["local", "google", "facebook", "twitter"],
      default: "local",
    },
    googleUserId: {
      type: String,
      sparse: true,
      index: true,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    loginCount: {
      type: Number,
      default: 0,
    },
    verificationToken: {
      type: String,
    },
    verificationTokenExpires: {
      type: Date,
    },
    photoURL: {
      type: String,
    },
  },
  { timestamps: true, versionKey: false }
);

export const User = mongoose.model("User", userSchema);
