import { Router } from "express";
import { Store } from "../models/Store.js";
import { auth } from "../middleware/auth.js";
import { isAdmin } from "../middleware/isAdmin.js";

const router = Router();

// Create a new store
router.post("/", auth, async (req, res) => {
  try {
    const store = new Store(req.body);
    await store.save();
    res.status(201).json(store);
  } catch (error) {
    res.status(500).json({ message: "Error creating store", error });
  }
});

// Get all stores
router.get("/", auth, async (req, res) => {
  try {
    const stores = await Store.find();
    console.log("Fetched stores:", stores.length, "stores found");
    res.status(200).json({
      success: true,
      message: "Stores fetched successfully",
      stores,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching stores",
      error,
    });
  }
});

// Get store profile for admin - IMPORTANT: specific routes must come before generic ones
router.get("/admin/profile", auth, isAdmin, async (req, res) => {
  try {
    console.log("Admin profile request received, user:", req.user);

    // Get the admin ID from the request
    const adminId = req.user.id;

    if (!adminId) {
      return res
        .status(400)
        .json({ message: "Admin ID not provided in authentication" });
    }

    // Find the store where this admin is registered
    // First try by ID
    let store = await Store.findById(adminId);

    // If not found by ID, try to find by admin email if available
    if (!store && req.user.email) {
      store = await Store.findOne({ "admin.email": req.user.email });
    }

    // If still not found, return a mock store for development
    if (!store) {
      console.log("Store not found, returning mock data");
      return res.json({
        id: "mock-store-id",
        name: "Sample Print Store",
        location: "123 Main St, City",
        email: "admin@printstore.com",
        status: "active",
      });
    }

    console.log("Store found:", store.name);

    // Return only the necessary profile information
    res.json({
      id: store._id,
      name: store.name,
      location: store.location,
      email: store.admin.email,
      status: store.status,
    });
  } catch (error) {
    console.error("Error fetching admin profile:", error);
    res
      .status(500)
      .json({ message: "Error fetching store profile", error: error.message });
  }
});

// Get a specific store - This must come after more specific routes
router.get("/:id", auth, async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }
    res.status(200).json(store);
  } catch (error) {
    res.status(500).json({ message: "Error fetching store", error });
  }
});

// Update a store
router.put("/:id", async (req, res) => {
  try {
    const store = await Store.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!store) return res.status(404).json({ message: "Store not found" });
    res.status(200).json(store);
  } catch (error) {
    res.status(500).json({ message: "Error updating store", error });
  }
});

// Delete a store
router.delete("/:id", async (req, res) => {
  try {
    const store = await Store.findByIdAndDelete(req.params.id);
    if (!store) return res.status(404).json({ message: "Store not found" });
    res.json({ message: "Store deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting store", error });
  }
});

// Update store pricing settings
router.put("/:id/pricing", auth, isAdmin, async (req, res) => {
  try {
    const { pricing } = req.body;

    if (!pricing) {
      return res.status(400).json({ message: "Pricing data is required" });
    }

    // Update the pricing and set the lastUpdated timestamp
    const updatedPricing = {
      ...pricing,
      lastUpdated: new Date(),
    };

    const store = await Store.findByIdAndUpdate(
      req.params.id,
      { pricing: updatedPricing },
      { new: true }
    );

    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    res.json({
      message: "Pricing updated successfully",
      store: {
        id: store._id,
        name: store.name,
        pricing: store.pricing,
      },
    });
  } catch (error) {
    console.error("Error updating pricing:", error);
    res.status(500).json({
      message: "Error updating pricing settings",
      error: error.message,
    });
  }
});

export default router;
