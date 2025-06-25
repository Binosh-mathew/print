import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { isDeveloper } from "../middleware/roleCheck.js";
import { Product } from "../models/Product.js";

const router = Router();

// Get all product categories
router.get("/categories", async (req, res) => {
  try {
    // Get the schema's enum values for the category field
    const categoryEnum = Product.schema.path('category').enumValues;
    
    res.status(200).json({
      success: true,
      categories: categoryEnum
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching product categories",
      error: error.message
    });
  }
});

// Get all products (public)
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ featured: -1, createdAt: -1 });
    res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching products",
      error: error.message
    });
  }
});

// Get product by ID (public)
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching product",
      error: error.message
    });
  }
});

// Create product (developer only)
router.post("/", auth, isDeveloper, async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    
    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating product",
      error: error.message
    });
  }
});

// Update product (developer only)
router.put("/:id", auth, isDeveloper, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating product",
      error: error.message
    });
  }
});

// Delete product (developer only)
router.delete("/:id", auth, isDeveloper, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Product deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting product",
      error: error.message
    });
  }
});

// Toggle featured status (developer only)
router.patch("/:id/toggle-featured", auth, isDeveloper, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }
    
    product.featured = !product.featured;
    product.updatedAt = Date.now();
    await product.save();
    
    res.status(200).json({
      success: true,
      message: `Product featured status ${product.featured ? "enabled" : "disabled"}`,
      featured: product.featured
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error toggling featured status",
      error: error.message
    });
  }
});

export default router;
