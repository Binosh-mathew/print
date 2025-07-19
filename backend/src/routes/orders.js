import { Router } from "express";
import { Order } from "../models/Order.js";
import { auth } from "../middleware/auth.js";
import cloudinary from "../utils/cloudinary.js";
import upload from "../utils/upload.js";
import rateLimit from "express-rate-limit";
import { SIGNED_URL_TTL } from "../config.js";
import { cleanupOldOrderFiles } from "../utils/cleanupClaudinary.js";

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
      
      // Format response order with capitalized status for frontend consistency
      const responseOrder = {
        ...savedOrder.toObject(),
        // Ensure status is capitalized for frontend consistency
        status: savedOrder.status.charAt(0).toUpperCase() + savedOrder.status.slice(1)
      };
      
      // Get Socket.IO instance for real-time updates
      const io = req.app.get("io");
      
      if (io) {
        // Emit to store-specific room
        console.log(`Emitting order:new event to store:${savedOrder.storeId}`);
        io.to(`store:${savedOrder.storeId}`).emit("order:new", responseOrder);
        
        // Also emit to user-specific room
        if (savedOrder.userId) {
          console.log(`Emitting order:new event to user:${savedOrder.userId}`);
          io.to(`user:${savedOrder.userId}`).emit("order:new", responseOrder);
        }
        
        // Also emit global update for pending count
        console.log("Emitting orders:updated event globally");
        io.emit("orders:updated");
      } else {
        console.warn("Socket.IO instance not available");
      }

      // Return the created order
      res.status(201).json({
        success: true,
        message: "Order created successfully",
        data: savedOrder,
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

//Manual cleanup endpoint for Cloudinary files
router.post("/cleanup-files", auth, async (req, res) => {
  try {
    // Check if user is admin or developer
    const { role } = req.user;

    if (role !== "developer") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to perform this action",
      });
    }

    // Run the cleanup
    const stats = await cleanupOldOrderFiles();

    return res.status(200).json({
      success: true,
      message: "Cloudinary cleanup completed",
      stats,
    });
  } catch (error) {
    console.error("Error in cleanup endpoint:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to clean up Cloudinary files",
      error: error.message,
    });
  }
});

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
        orders: orders.map(order => ({
          ...order.toObject(),
          // Ensure status is capitalized for frontend consistency
          status: order.status.charAt(0).toUpperCase() + order.status.slice(1)
        })),
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
      
      // Map and format response orders
      responseOrders = responseOrders.map(order => ({
        ...order.toObject(),
        // Ensure status is capitalized for frontend consistency
        status: order.status.charAt(0).toUpperCase() + order.status.slice(1)
      }));
    }

    if (role === "admin") {
      responseOrders = orders.filter((order) => order.storeId === userId);
      if (responseOrders.length === 0) {
        return res.status(200).json({
          success: true,
          message: "No orders found for this store",
          orders: [],
        });
      }
      
      // Map and format response orders
      responseOrders = responseOrders.map(order => ({
        ...order.toObject(),
        // Ensure status is capitalized for frontend consistency
        status: order.status.charAt(0).toUpperCase() + order.status.slice(1)
      }));
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
    
    // Format the order object with capitalized status for frontend consistency
    const orderObject = {
      ...order.toObject(), 
      files: filesWithSignedUrls,
      // Ensure status is capitalized for frontend consistency
      status: order.status.charAt(0).toUpperCase() + order.status.slice(1)
    };

    res.json(orderObject);
  } catch (error) {
    console.error("Error fetching single order:", error);
    res
      .status(500)
      .json({ message: "Error fetching order", error: error.message });
  }
});

// Update an order
router.put("/:id", auth, async (req, res) => {
  try {
    // If status is provided, ensure it's lowercase for storage
    const orderData = { ...req.body };
    if (orderData.status) {
      // Convert status to lowercase for storage consistency
      orderData.status = orderData.status.toLowerCase();
      console.log(`Normalized status for update: ${orderData.status}`);
    }
    
    const order = await Order.findByIdAndUpdate(
      req.params.id, 
      orderData, 
      { new: true, runValidators: true }
    );
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }
    
    // Format response order with capitalized status for frontend consistency
    const responseOrder = {
      ...order.toObject(),
      // Ensure status is capitalized for frontend consistency
      status: order.status.charAt(0).toUpperCase() + order.status.slice(1)
    };

    // Get Socket.IO instance for real-time updates
    const io = req.app.get("io");
    
    if (io) {
      // Emit to store-specific room
      console.log(`Emitting order:updated event to store:${order.storeId}`);
      io.to(`store:${order.storeId}`).emit("order:updated", responseOrder);
      
      // Emit to user-specific room
      if (order.userId) {
        console.log(`Emitting order:updated event to user:${order.userId}`);
        io.to(`user:${order.userId}`).emit("order:updated", responseOrder);
      }
      
      // Also emit the old status:updated event for backward compatibility
      console.log(`Emitting order:statusUpdated event to user:${order.userId}`);
      io.to(`user:${order.userId}`).emit("order:statusUpdated", responseOrder);
      
      // Emit global update for pending count changes
      console.log("Emitting orders:updated event globally");
      io.emit("orders:updated");
    } else {
      console.warn("Socket.IO instance not available");
    }

    res.status(200).json({
      success: true,
      message: "Order updated successfully",
      data: responseOrder,
    });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({
      success: false,
      message: "Error updating order",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Delete an order
router.delete("/:id", auth, async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Get Socket.IO instance for real-time updates
    const io = req.app.get("io");
    
    if (io) {
      // Emit to store-specific room
      console.log(`Emitting order:deleted event to store:${order.storeId} for order ${order._id}`);
      io.to(`store:${order.storeId}`).emit("order:deleted", order._id);
      
      // Emit to user-specific room
      if (order.userId) {
        console.log(`Emitting order:deleted event to user:${order.userId} for order ${order._id}`);
        io.to(`user:${order.userId}`).emit("order:deleted", order._id);
      }
      
      // Emit global update for pending count changes
      console.log("Emitting orders:updated event globally");
      io.emit("orders:updated");
    } else {
      console.warn("Socket.IO instance not available");
    }

    res.json({
      success: true,
      message: "Order deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting order",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

router.get("/pending-by-store", async (req, res) => {
  try {
    console.log("Fetching pending orders by store");
    
    // Use lowercase "pending" for consistency
    const pendingOrders = await Order.find({ status: "pending" }).lean();
    console.log(`Found ${pendingOrders.length} pending orders`);
    
    // Count manually by storeId
    const pendingOrdersByStore = {};
    for (const order of pendingOrders) {
      if (order.storeId) {
        const storeId = order.storeId.toString();
        pendingOrdersByStore[storeId] = (pendingOrdersByStore[storeId] || 0) + 1;
      }
    }
    
    console.log("Pending orders by store:", pendingOrdersByStore);
    
    // Use consistent response format with 'data' property
    res.status(200).json({
      success: true,
      message: "Pending orders by store fetched successfully",
      data: pendingOrdersByStore
    });
  } catch (error) {
    console.error("Error fetching pending orders by store:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching pending orders by store",
      error: error.message
    });
  }
});

export default router;
