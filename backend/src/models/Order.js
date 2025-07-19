import mongoose from "mongoose";

// Define a separate schema for the binding object
const bindingSchema = new mongoose.Schema({
  needed: Boolean,
  type: String
}, { _id: false }); // _id: false prevents MongoDB from creating IDs for subdocuments

// Define a separate schema for file details
const fileSchema = new mongoose.Schema({
  fileName: String, // Cloudinary URL
  publicId: String, // Cloudinary public ID
  originalName: String, // Original name of the file
  copies: Number,
  specialPaper: String,
  printType: String,
  doubleSided: Boolean,
  binding: bindingSchema,
  specificRequirements: String
}, { _id: false });

const orderSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  documentName: { type: String, required: true },
  userId: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'completed'], 
    default: 'pending',
    set: (status) => status.toLowerCase() // Always store lowercase status
  },
  files: [fileSchema],
  details: String,
  copies: Number,
  colorType: String,
  doubleSided: Boolean,
  totalPrice: Number,
  storeId: { type: String },
  storeName: String,
}, { timestamps: true });

export const Order = mongoose.model('Order', orderSchema); 