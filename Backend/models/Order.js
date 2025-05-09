
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
  },
  customerName: {
    type: String,
    required: true,
  },
  orderDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Completed'],
    default: 'Pending',
  },
  details: {
    type: String,
    required: false,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  files: {
    type: Array,
    required: false,
    default: [],
  },
  copies: {
    type: Number,
    required: false,
    default: 1,
  },
  colorType: {
    type: String,
    enum: ['color', 'blackAndWhite'],
    default: 'blackAndWhite',
  },
  doubleSided: {
    type: Boolean,
    default: false,
  },
  totalPrice: {
    type: Number,
    default: 0,
  },
  userName: {
    type: String,
    required: false,
  },
  documentName: {
    type: String,
    required: false,
  }
}, { 
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id.toString(); // Always ensure id is included as a string
      return ret;
    }
  },
  toObject: { 
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id.toString(); // Always ensure id is included as a string
      return ret;
    }
  }
});

// Before saving, ensure the ID field is properly set
orderSchema.pre('save', function(next) {
  if (!this.id) {
    this.id = this._id.toString();
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
