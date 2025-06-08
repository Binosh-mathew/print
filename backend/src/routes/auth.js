import dotenv from "dotenv";
dotenv.config();

import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { Developer } from "../models/Developer.js";
import { Store } from "../models/Store.js";
import { LoginActivity } from "../models/LoginActivity.js";
import { auth } from "../middleware/auth.js";
import { request } from "http";

const router = Router();

// Register a new user
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("User already exists:", email);
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    if (!hashedPassword) {
      console.error("Error hashing password");
      return res.status(500).json({
        success: false,
        message: "Internal server error: unable to hash password",
      });
    }
    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error:Error registering user",
      error,
    });
  }
});

// Login a user, admin, or developer
router.post("/login", async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  try {
    let user;
    if (role === "developer") {
      user = await Developer.findOne({ email });
    } else if (role === "admin") {
      // Find the store with this admin email
      const store = await Store.findOne({ "admin.email": email });
      if (store && store.admin) {
        user = {
          _id: store._id,
          username: store.admin.username,
          email: store.admin.email,
          password: store.admin.password,
          role: "admin",
        };
      }
    } else {
      user = await User.findOne({ email });
    }

    if (!user) {
      return res.status(400).json({ message: "No User found" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Password" });
    }
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        name: user.username,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "14d" }
    );

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    await LoginActivity.create({
      userName: user.username,
      userRole: user.role,
      timestamp: new Date(),
      ipAddress: req.ip,
      action: "login",
    });
    res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
  }
});

router.post("/logout", auth, (req, res) => {
  // Clear the JWT cookie
  if (!req.cookies.jwt) {
    return res
      .status(400)
      .json({ success: false, message: "No user logged in" });
  }

  res.clearCookie("jwt", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

// Update user profile
router.put("/update", auth, async (req, res) => {
  try {
    const { id, username } = req.body;
    // Verify the authenticated user is updating their own profile
    if (req.user.id !== id) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this profile" });
    }

    // Find the user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update fields
    if (username) {
      // Check if username is already taken
      const existingUser = await User.findOne({
        username,
        _id: { $ne: id },
      });
      if (existingUser) {
        return res.status(400).json({ message: "Username already taken" });
      }
      user.username = username;
    }

    // Save the updated user
    await user.save();

    // Return the updated user data
    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res
      .status(500)
      .json({ message: "Error updating profile", error: error.message });
  }
});

//Find user by email

router.get("/:email", auth, async (req, res) => {
  try {
    const email = req.params.email;
    if (!email || !req.params) {
      return res.status(400).json({
        success: false,
        message: "Invalid request",
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User found",
      user,
    });
  } catch (error) {
    console.log(error);
  }
});

export default router;
