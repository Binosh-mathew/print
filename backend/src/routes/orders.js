import { Router } from "express";
import { Order } from "../models/Order.js";
import { auth } from "../middleware/auth.js";
import cloudinary from "../utils/cloudinary.js";
import upload from "../utils/upload.js";
import rateLimit from "express-rate-limit";
import { SIGNED_URL_TTL } from "../config.js";
import { cleanupOldOrderFiles } from "../utils/cleanupClaudinary.js";

const router = Router();

// Helper function to determine resource type from mimetype
const getResourceType = (mimetype) => {
  if (!mimetype) return 'raw';
  if (mimetype.startsWith('video/')) return 'video';
  if (mimetype.startsWith('image/')) return 'image';
  return 'raw';
};

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
          resourceType: getResourceType(file.mimetype), // Store the resource type
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

//Manual cleanup endpoint for Cloudinary files
router.post("/cleanup-files", auth, async (req, res) => {
  try {
    // Check if user is admin or developer
    const { role } = req.user;
    
    if (role !== "developer") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to perform this action"
      });
    }
    
    // Run the cleanup
    const stats = await cleanupOldOrderFiles();
    
    return res.status(200).json({
      success: true,
      message: "Cloudinary cleanup completed",
      stats
    });
  } catch (error) {
    console.error("Error in cleanup endpoint:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to clean up Cloudinary files",
      error: error.message
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
        // Use the stored resourceType, or default to 'raw' if not present (for old orders)
        const resourceType = file.resourceType || 'raw';
        
        console.log(`Generating signed URL for file: ${file.publicId}, resourceType: ${resourceType}`);
        console.log(`Original file name: ${file.originalName}`);
        
        // For raw files, check if the public_id already includes the extension
        let publicIdToUse = file.publicId;
        const fileExtension = file.originalName ? file.originalName.split('.').pop().toLowerCase() : null;
        
        if (resourceType === 'raw') {
          const publicIdHasExtension = fileExtension && file.publicId.toLowerCase().endsWith(`.${fileExtension}`);
          
          if (!publicIdHasExtension && fileExtension) {
            // Old order - the file was uploaded without extension but Cloudinary stores it with one
            // We need to append it to access the file
            publicIdToUse = `${file.publicId}.${fileExtension}`;
            console.log(`Old order detected - appending extension for access`);
          }
        }
        
        console.log(`Final public ID: ${publicIdToUse}`);
        
        // Generate authenticated URL using Cloudinary's private_download_url
        // This is specifically designed for secure file downloads
        try {
          const signedUrl = cloudinary.utils.private_download_url(
            publicIdToUse,
            fileExtension || 'pdf', // format
            {
              resource_type: resourceType,
              type: 'upload',
              expires_at: Math.floor(Date.now() / 1000) + SIGNED_URL_TTL,
            }
          );
          
          console.log(`Generated private download URL: ${signedUrl}`);
          
          return { ...file.toObject(), fileName: signedUrl };
        } catch (urlError) {
          console.error(`Error generating private download URL, falling back to standard URL:`, urlError.message);
          
          // Fallback to standard signed URL
          const signedUrl = cloudinary.url(publicIdToUse, {
            resource_type: resourceType,
            type: 'upload',
            sign_url: true,
            secure: true,
            expires_at: Math.floor(Date.now() / 1000) + SIGNED_URL_TTL,
          });
          
          console.log(`Generated fallback signed URL: ${signedUrl}`);
          
          return { ...file.toObject(), fileName: signedUrl };
        }
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

// NOTE: This endpoint requires auth. There is also a public version defined directly in index.js
// that should be used by the frontend for unauthenticated requests
router.get("/pending-by-store", async (req, res) => {
  try {
    console.log("Fetching pending orders by store (public endpoint)");
    
    // Get all pending orders
    const pendingOrders = await Order.find({ status: "Pending" }).lean();
    console.log(`Found ${pendingOrders.length} total pending orders`);
    
    // Count manually by storeId
    const pendingOrdersByStore = {};
    for (const order of pendingOrders) {
      if (order.storeId) {
        const storeId = order.storeId.toString(); // Ensure it's a string
        pendingOrdersByStore[storeId] = (pendingOrdersByStore[storeId] || 0) + 1;
      }
    }
    
    // Log counts for debugging
    console.log("Pending orders by store:", pendingOrdersByStore);
    
    res.status(200).json({
      success: true,
      message: "Pending orders by store fetched successfully",
      pendingOrdersByStore
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
