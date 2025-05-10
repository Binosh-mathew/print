const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  documentName: {
    type: String,
    required: true
  },
  documentUrl: {
    type: String,
    required: true
  },
  copies: {
    type: Number,
    required: true,
    min: 1
  },
  paperSize: {
    type: String,
    enum: ['A4', 'A3', 'Letter', 'Legal'],
    required: true
  },
  paperType: {
    type: String,
    enum: ['Normal', 'Glossy', 'Matte'],
    required: true
  },
  color: {
    type: Boolean,
    default: false
  },
  doubleSided: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  totalPrice: {
    type: Number,
    required: true
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
orderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Order', orderSchema); 