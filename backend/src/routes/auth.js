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
import { v4 as uuidv4 } from "uuid";
import { sendVerificationEmail } from "../utils/emailService.js";

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
    
    // Generate verification token and expiry (24 hours from now)
    const verificationToken = uuidv4();
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    // Create user with verification data
    const user = new User({ 
      username, 
      email, 
      password: hashedPassword,
      isVerified: false,
      verificationToken,
      verificationTokenExpires
    });
    await user.save();
    
    // Send verification email
    try {
      await sendVerificationEmail(email, verificationToken, username);
      console.log("Verification email sent to:", email);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // We continue with user creation even if email fails
      // A resend verification option will be available
    }

    res.status(201).json({
      success: true,
      message: "User registered successfully. Please check your email to verify your account.",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error: Error registering user",
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
      
      // Check if regular user is verified (only for regular users, not admin or developer)
      if (user && role === "user" && !user.isVerified) {
        return res.status(403).json({ 
          success: false,
          message: "Please verify your email before logging in",
          needsVerification: true 
        });
      }
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
    });    res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      token: token, // Include the token in the response
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
  }
});

//Logout a user, admin, or developer
router.post("/logout", (req, res) => {
  // For backward compatibility, still try to clear the JWT cookie if it exists
  if (req.cookies.jwt) {
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });
  }
  
  // Always return success, even if there's no cookie
  // Since we're now using Authorization header, the client will handle token removal
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

router.get("/verify", async (req, res) => {
  //check if the user is authorized
  const token = req.cookies.jwt;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized, no token provided",
    });
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (!decoded) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized, invalid token",
    });
  }

  const userId = decoded.id;

  const user = await User.findById(userId).select("-password");
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "User verified successfully",
    user,
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

// Verify Email Route
router.get("/verify-email/:token", async (req, res) => {
  try {
    const { token } = req.params;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Verification token is required"
      });
    }
    
    console.log(`Verifying email with token: ${token}`);
    
    // Find user with this token that hasn't expired yet
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      console.log(`No user found with token: ${token}`);
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token"
      });
    }
    
    console.log(`Found user: ${user.email} with valid token`);
    
      // Mark the user as verified and clear the token
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();
    
    console.log(`Successfully verified email for user: ${user.email}`);
    
    return res.status(200).json({
      success: true,
      message: "Email verified successfully. You can now log in."
    });
  } catch (error) {
    console.error("Error verifying email:", error);
    return res.status(500).json({
      success: false,
      message: "Error verifying email",
      error: error.message
    });
  }
});

// Resend Verification Email
router.post("/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }
    
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified"
      });
    }
    
    // Generate new verification token and expiry
    const verificationToken = uuidv4();
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    // Update user with new token
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = verificationTokenExpires;
    await user.save();
    
    // Send new verification email
    await sendVerificationEmail(user.email, verificationToken, user.username);
    
    return res.status(200).json({
      success: true,
      message: "Verification email sent successfully"
    });
  } catch (error) {
    console.error("Error resending verification email:", error);
    return res.status(500).json({
      success: false,
      message: "Error resending verification email",
      error: error.message
    });
  }
});

// Check if an email exists
router.post("/check-email", async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }
    
    // Check if the email exists in the User collection
    const user = await User.findOne({ email });
    
    return res.status(200).json({
      success: true,
      exists: !!user
    });
  } catch (error) {
    console.error("Error checking email existence:", error);
    return res.status(500).json({
      success: false,
      message: "Error checking email",
      error: error.message
    });
  }
});

// Google Auth
router.post("/google-auth", async (req, res) => {
  try {
    const { email, name, photoURL, uid, syncProfile } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Find if user exists already
    let user = await User.findOne({ email });
    let isNewUser = false;
    
    if (!user) {
      // Create new user if doesn't exist
      isNewUser = true;
      
      // Generate a secure random password for Google Auth users
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(uid + "-FIREBASE-AUTH", salt);
      
      user = new User({
        username: name || email.split("@")[0],
        email,
        password: hashedPassword, // Use hashed password to meet the schema requirement
        isVerified: true, // Auto-verified since it's coming from Google
        photoURL,
        authProvider: 'google',
        lastLogin: new Date(),
        googleUserId: uid
      });
      
      await user.save();
    } else {
      // Existing user - update their profile if requested
      if (syncProfile) {
        // Update profile data from Google
        user.username = name || user.username;
        user.photoURL = photoURL || user.photoURL;
        user.isVerified = true; // Always ensure Google users are verified
        user.lastLogin = new Date();
        user.authProvider = 'google'; // Mark as Google auth user
        user.googleUserId = uid || user.googleUserId;
        
        await user.save();
      } else {
        // Just update login time
        user.lastLogin = new Date();
        await user.save();
      }
    }
    
    // Generate JWT token
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
    
    // Record login activity
    await LoginActivity.create({
      userName: user.username,
      userRole: user.role,
      timestamp: new Date(),
      ipAddress: req.ip,
      action: "login-google",
    });
    
    res.status(200).json({
      success: true,
      message: "Google authentication successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        photoURL: user.photoURL || photoURL
      },
      token
    });
    
  } catch (error) {
    console.error("Google auth error:", error);
    res.status(500).json({ 
      success: false,
      message: "Error with Google authentication", 
      error: error.message 
    });
  }
});

export default router;
