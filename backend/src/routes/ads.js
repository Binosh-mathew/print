import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { isDeveloper } from "../middleware/roleCheck.js";
import { Ad } from "../models/Ad.js";
import { User } from "../models/User.js";
import upload from "../utils/upload.js";
import cloudinary from "../utils/cloudinary.js";
import mongoose from "mongoose";

const router = Router();

// Log all requests for debugging
router.use((req, res, next) => {
  console.log(`Ads API: ${req.method} ${req.originalUrl}`);
  next();
});

// SPECIAL ROUTES FIRST (to avoid conflicts with parameter routes)
// These must be defined before routes with path parameters (:id)

// Upload video file (developer only)
router.post("/upload/video", auth, isDeveloper, upload.single("video"), async (req, res) => {
  try {
    console.log("Upload video route hit");
    console.log("Request body:", req.body);
    console.log("Request file:", req.file);
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No video file uploaded"
      });
    }

    // Get the file data from Cloudinary
    const result = req.file;
    console.log("Upload result:", result);

    // Return the URL and other data
    res.status(201).json({
      success: true,
      message: "Video uploaded successfully",
      videoUrl: result.path,
      public_id: result.filename || result.public_id
    });
  } catch (error) {
    console.error("Error uploading video:", error);
    res.status(500).json({
      success: false,
      message: "Error uploading video",
      error: error.message
    });
  }
});

// Upload thumbnail file (developer only)
router.post("/upload/thumbnail", auth, isDeveloper, upload.single("thumbnail"), async (req, res) => {
  try {
    console.log("Upload thumbnail route hit");
    console.log("Request body:", req.body);
    console.log("Request file:", req.file);
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No thumbnail file uploaded"
      });
    }

    // Get the file data from Cloudinary
    const result = req.file;
    console.log("Upload result:", result);

    // Return the URL and other data
    res.status(201).json({
      success: true,
      message: "Thumbnail uploaded successfully",
      thumbnailUrl: result.path,
      public_id: result.filename || result.public_id,
      width: result.width,
      height: result.height
    });
  } catch (error) {
    console.error("Error uploading thumbnail:", error);
    res.status(500).json({
      success: false,
      message: "Error uploading thumbnail",
      error: error.message
    });
  }
});

// Get user's supercoins
router.get("/user/supercoins", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    res.status(200).json({
      success: true,
      supercoins: user.supercoins || 0
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching supercoins",
      error: error.message
    });
  }
});

// REGULAR ROUTES (including parameter routes)

// Get all ads (public for users to view)
router.get("/", auth, async (req, res) => {
  try {
    console.log("GET /ads endpoint called by user:", req.user.id, "role:", req.user.role);
    
    // For developers, return all ads with view count
    // For regular users, only return active ads that they haven't watched yet
    if (req.user.role === "developer") {
      console.log("Developer user, fetching all ads with view counts");
      
      try {
        // Get all ads first
        const allAds = await Ad.find({}).sort({ createdAt: -1 });
        console.log(`Found ${allAds.length} total ads for developer view`);
        
        // Get all users to count watched ads
        const users = await User.find({}, 'watchedAds');
        console.log(`Found ${users.length} total users for view count calculation`);
        
        // Create a map of adId -> view count
        const adViewCounts = {};
        
        // Count views for each ad
        users.forEach(user => {
          if (user.watchedAds && Array.isArray(user.watchedAds)) {
            user.watchedAds.forEach(watched => {
              if (watched && watched.adId) {
                const adId = watched.adId.toString();
                adViewCounts[adId] = (adViewCounts[adId] || 0) + 1;
              }
            });
          }
        });
        
        // Add view count to each ad
        const adsWithViewCounts = allAds.map(ad => {
          const adObject = ad.toObject();
          adObject.viewCount = adViewCounts[ad._id.toString()] || 0;
          return adObject;
        });
        
        return res.status(200).json({
          success: true,
          count: adsWithViewCounts.length,
          ads: adsWithViewCounts
        });
      } catch (error) {
        console.error("Error processing developer ad view:", error);
        return res.status(500).json({
          success: false,
          message: "Error fetching ads for developer view",
          error: error.message
        });
      }
    } else {
      console.log("Regular user, fetching active unseen ads");
      
      try {
        // For regular users
        // 1. Get all active ads
        const activeAds = await Ad.find({ active: true }).sort({ createdAt: -1 });
        console.log(`Found ${activeAds.length} active ads total`);
        
        // 2. Get the user with their watchedAds
        const user = await User.findById(req.user.id);
        
        if (!user) {
          return res.status(404).json({
            success: false,
            message: "User not found"
          });
        }
        
        // 3. Filter out ads that user has already watched
        const result = [];
        
        // Safety check for watchedAds property
        if (!user.watchedAds || !Array.isArray(user.watchedAds)) {
          // User has no watchedAds array, return all active ads
          console.log("User has no watchedAds array, returning all active ads");
          return res.status(200).json({
            success: true,
            count: activeAds.length,
            ads: activeAds
          });
        }
        
        // Extract watched ad IDs into a Set for faster lookups
        const watchedAdIds = new Set();
        
        user.watchedAds.forEach(watched => {
          if (watched && watched.adId) {
            watchedAdIds.add(watched.adId.toString());
          }
        });
        
        console.log(`User has watched ${watchedAdIds.size} ads`);
        
        // Filter active ads to only include those not watched
        const unseenAds = activeAds.filter(ad => {
          return !watchedAdIds.has(ad._id.toString());
        });
        
        console.log(`Returning ${unseenAds.length} unseen active ads to user`);
        
        return res.status(200).json({
          success: true,
          count: unseenAds.length,
          ads: unseenAds
        });
      } catch (error) {
        console.error("Error fetching ads for regular user:", error);
        return res.status(500).json({
          success: false,
          message: "Error fetching ads",
          error: error.message
        });
      }
    }
    
  } catch (error) {
    console.error("Error in GET /ads endpoint:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching ads",
      error: error.message
    });
  }
});

// Upload video file (developer only)
router.post("/upload/video", auth, isDeveloper, upload.single("video"), async (req, res) => {
  try {
    console.log("Upload video route hit");
    console.log("Request body:", req.body);
    console.log("Request file:", req.file);
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No video file uploaded"
      });
    }

    // Get the file data from Cloudinary
    const result = req.file;
    console.log("Upload result:", result);

    // Return the URL and other data
    res.status(201).json({
      success: true,
      message: "Video uploaded successfully",
      videoUrl: result.path,
      public_id: result.filename || result.public_id
    });
  } catch (error) {
    console.error("Error uploading video:", error);
    res.status(500).json({
      success: false,
      message: "Error uploading video",
      error: error.message
    });
  }
});

// Upload thumbnail file (developer only)
router.post("/upload/thumbnail", auth, isDeveloper, upload.single("thumbnail"), async (req, res) => {
  try {
    console.log("Upload thumbnail route hit");
    console.log("Request body:", req.body);
    console.log("Request file:", req.file);
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No thumbnail file uploaded"
      });
    }

    // Get the file data from Cloudinary
    const result = req.file;
    console.log("Upload result:", result);

    // Return the URL and other data
    res.status(201).json({
      success: true,
      message: "Thumbnail uploaded successfully",
      thumbnailUrl: result.path,
      public_id: result.filename || result.public_id,
      width: result.width,
      height: result.height
    });
  } catch (error) {
    console.error("Error uploading thumbnail:", error);
    res.status(500).json({
      success: false,
      message: "Error uploading thumbnail",
      error: error.message
    });
  }
});

// Get user's supercoins
router.get("/user/supercoins", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    res.status(200).json({
      success: true,
      supercoins: user.supercoins || 0
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching supercoins",
      error: error.message
    });
  }
});

// Get a specific ad by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    
    if (!ad) {
      return res.status(404).json({
        success: false,
        message: "Ad not found"
      });
    }

    // If user is not a developer and ad is not active, don't allow access
    if (req.user.role !== "developer" && !ad.active) {
      return res.status(403).json({
        success: false,
        message: "This ad is not currently available"
      });
    }
    
    res.status(200).json({
      success: true,
      ad
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching ad",
      error: error.message
    });
  }
});

// Create a new ad (developer only)
router.post("/", auth, isDeveloper, async (req, res) => {
  try {
    const ad = new Ad({
      ...req.body,
      createdBy: req.user.id
    });
    
    await ad.save();
    
    res.status(201).json({
      success: true,
      message: "Ad created successfully",
      ad
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating ad",
      error: error.message
    });
  }
});

// Update an ad (developer only)
router.put("/:id", auth, isDeveloper, async (req, res) => {
  try {
    const ad = await Ad.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    if (!ad) {
      return res.status(404).json({
        success: false,
        message: "Ad not found"
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Ad updated successfully",
      ad
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating ad",
      error: error.message
    });
  }
});

// Delete an ad (developer only)
router.delete("/:id", auth, isDeveloper, async (req, res) => {
  try {
    const ad = await Ad.findByIdAndDelete(req.params.id);
    
    if (!ad) {
      return res.status(404).json({
        success: false,
        message: "Ad not found"
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Ad deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting ad",
      error: error.message
    });
  }
});

// Mark ad as watched and award supercoins
router.post("/:id/watch", auth, async (req, res) => {
  try {
    const adId = req.params.id;
    const userId = req.user.id;
    
    // Find the ad
    const ad = await Ad.findById(adId);
    
    if (!ad) {
      return res.status(404).json({
        success: false,
        message: "Ad not found"
      });
    }
    
    // Check if ad is active
    if (!ad.active) {
      return res.status(400).json({
        success: false,
        message: "This ad is not currently active"
      });
    }
    
    // Find the user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    // Check if user has already watched this ad
    const alreadyWatched = user.watchedAds.some(watched => {
      if (!watched.adId) return false;
      // Compare string representations of IDs for consistency
      const watchedAdIdStr = watched.adId.toString();
      const currentAdIdStr = adId.toString();
      console.log(`Comparing watched ad ID ${watchedAdIdStr} with current ad ID ${currentAdIdStr}`);
      return watchedAdIdStr === currentAdIdStr;
    });
    
    if (alreadyWatched) {
      return res.status(400).json({
        success: false,
        message: "You've already earned rewards for watching this ad"
      });
    }
    
    // Initialize watchedAds array if it doesn't exist
    if (!user.watchedAds) {
      user.watchedAds = [];
    }
    
    // Add to watched ads and update supercoins
    // Store the adId as the original ObjectId to maintain consistency
    user.watchedAds.push({ adId: ad._id });
    user.supercoins = (user.supercoins || 0) + ad.rewardCoins;
    
    // Log the updated watchedAds for debugging
    console.log(`User ${userId} watched ad ${adId}. Updated watchedAds:`, 
                user.watchedAds.map(w => w.adId ? w.adId.toString() : 'invalid'));
    
    await user.save();
    
    // Refetch the current user data to ensure it's updated in-memory
    const updatedUser = await User.findById(userId);
    
    res.status(200).json({
      success: true,
      message: `Congratulations! You earned ${ad.rewardCoins} supercoins`,
      supercoins: updatedUser.supercoins,
      // Return the updated watchedAds to help with debugging
      watchedAds: updatedUser.watchedAds.map(w => w.adId.toString())
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error processing watched ad",
      error: error.message
    });
  }
});

export default router;
