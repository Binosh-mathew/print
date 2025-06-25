import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Product name is required"],
    trim: true
  },
  description: {
    type: String,
    required: [true, "Product description is required"]
  },
  price: {
    type: String,
    required: [true, "Product price is required"]
  },
  discountPrice: {
    type: String,
    default: null
  },
  image: {
    type: String,
    required: [true, "Product image URL is required"]
  },
  category: {
    type: String,
    required: [true, "Product category is required"],
    enum: [
      "electronics", 
      "software", 
      "printing", 
      "books", 
      "office", 
      "accessories",
      "stationery",
      "art",
      "craft",
      "paper",
      "storage",
      "furniture",
      "digital",
      "beauty",
      "other"
    ]
  },
  tags: [{
    type: String,
    trim: true
  }],
  affiliateUrl: {
    type: String,
    required: [true, "Affiliate URL is required"]
  },
  featured: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export const Product = mongoose.model("Product", productSchema);
