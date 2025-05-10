const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  documentName: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Completed'], default: 'Pending' },
  files: [{
    fileName: String,
    copies: Number,
    specialPaper: String,
    printType: String,
    doubleSided: Boolean,
    binding: {
      needed: Boolean,
      type: String,
    },
    specificRequirements: String,
  }],
  details: String,
  copies: Number,
  colorType: String,
  doubleSided: Boolean,
  totalPrice: Number,
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },
  storeName: String,
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema); 