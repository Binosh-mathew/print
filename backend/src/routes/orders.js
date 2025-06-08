import { Router } from "express";
import { Order } from "../models/Order.js";

const router = Router();

// Create a new order
router.post("/", async (req, res) => {
  try {
    // Log the incoming request body for debugging
    console.log("Order creation request body:", req.body);

    // Process the files array to ensure it matches our schema
    if (req.body.files && Array.isArray(req.body.files)) {
      req.body.files = req.body.files.map((file) => {
        return {
          fileName: file.fileName || "",
          copies: file.copies || 1,
          specialPaper: file.specialPaper || "none",
          printType: file.printType || "blackAndWhite",
          doubleSided: file.doubleSided || false,
          binding: {
            needed: file.binding?.needed || false,
            type: file.binding?.type || "none",
          },
          specificRequirements: file.specificRequirements || "",
        };
      });
    }

    // Create a new order with the processed request body
    const order = new Order(req.body);

    // Save the order to the database
    const savedOrder = await order.save();
    console.log("Order saved successfully:", savedOrder);

    // Return the created order
    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: savedOrder,
    });
  } catch (error) {
    // Log the detailed error for debugging
    console.error("Error creating order:", error);
    res.status(500).json({
      message: "Error creating order",
      error: error.message,
      details: error.toString(),
    });
  }
});

// Get all orders
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      orders: orders,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error });
  }
});

// Get a specific order
router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Error fetching order", error });
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
