import { Router } from "express";
import { Order } from "../models/Order.js";
import { auth } from "../middleware/auth.js";
import cloudinary from "../utils/cloudinary.js";
import upload from "../utils/upload.js";
import rateLimit from "express-rate-limit";
import { SIGNED_URL_TTL } from "../config.js";

const router = Router();

// Rate limiter for order creation (10 req/min per IP)
const createLimiter = rateLimit({ windowMs: 60_000, max: 10 });

// Create a new order with file upload
router.post(
  "/",
  auth,
  createLimiter,
  upload.array("files", 10),
  async (req, res) => {
    try {
      // Parse file details from the request body
      const fileDetails = JSON.parse(req.body.fileDetails || "[]");

      // Map uploaded files to their details
      const filesForOrder = req.files.map((file, index) => {
        const details = fileDetails[index] || {};
        return {
          fileName: file.path, // Cloudinary URL
          publicId: file.filename, // Cloudinary public_id
          originalName: file.originalname,
          ...details, // Merge with additional details
          copies: details.copies || 1,
          specialPaper: details.specialPaper || "none",
          printType: details.printType || "blackAndWhite",
          doubleSided: details.doubleSided || false,
          binding: {
            needed: details.binding?.needed || false,
            type: details.binding?.type || "none",
          },
          specificRequirements: details.specificRequirements || "",
        };
      });

      // Create the order data object
      const orderData = {
        ...req.body,
        files: filesForOrder,
        totalPrice: Number(req.body.totalPrice),
        copies: filesForOrder.reduce((acc, file) => acc + file.copies, 0),
        doubleSided: filesForOrder.some((file) => file.doubleSided),
      };

      // Create a new order with the processed data
      const order = new Order(orderData);

      // Save the order to the database
      const savedOrder = await order.save();

      // Return the created order
      res.status(201).json({
        success: true,
        message: "Order created successfully",
        order: savedOrder,
      });
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({
        message: "Error creating order",
        error: error.message,
        details: error.toString(),
      });
    }
  }
);

// Get all orders
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized, user ID not found",
      });
    }

    let responseOrders = [];
    // Fetch all orders from the database
    const orders = await Order.find();

    if (!orders || orders.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No orders found",
        orders: [],
      });
    }

    // If user is admin or developer, return all orders
    if (role === "developer") {
      return res.status(200).json({
        success: true,
        message: "All orders fetched successfully",
        orders: orders,
      });
    }

    if (role === "user") {
      responseOrders = orders.filter((order) => order.userId === userId);
      // If no orders found for this user, return empty array with 200 status
      if (responseOrders.length === 0) {
        return res.status(200).json({
          success: true,
          message: "No orders found for this user",
          orders: [],
        });
      }
    }

    if (role === "admin") {
      responseOrders = orders.filter((order) => order.storeId === userId);
      if (responseOrders.length === 0) {
        return res.status(200).json({
          success: true,
          message: "No orders found for this user",
          orders: [],
        });
      }
    }

    // Return the user's orders
    return res.status(200).json({
      success: true,
      message: "User orders fetched successfully",
      orders: responseOrders,
    });
  } catch (error) {
    // Return an empty array with 200 status rather than an error
    // This is more user-friendly especially for new users
    return res.status(200).json({
      success: true,
      message: "Error fetching orders, returning empty array",
      error: error.message,
      orders: [],
    });
  }
});

// Rate-limit signed-URL fetch (10 req/min per IP)
const fetchLimiter = rateLimit({ windowMs: 60_000, max: 10 });

router.get("/:id", auth, fetchLimiter, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Generate signed URLs for each file
    const filesWithSignedUrls = order.files.map((file) => {
      if (file.publicId) {
        const signedUrl = cloudinary.url(file.publicId, {
          resource_type: "raw",
          sign_url: true,
          secure: true,
          expires_at: Math.floor(Date.now() / 1000) + SIGNED_URL_TTL,
        });
        return { ...file.toObject(), fileName: signedUrl };
      }
      return file.toObject();
    });

    res.json({ ...order.toObject(), files: filesWithSignedUrls });
  } catch (error) {
    console.error("Error fetching single order:", error);
    res
      .status(500)
      .json({ message: "Error fetching order", error: error.message });
  }
});

// Update an order
router.put("/:id", async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Error updating order", error });
  }
});

// Delete an order
router.delete("/:id", async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting order", error });
  }
});

export default router;
