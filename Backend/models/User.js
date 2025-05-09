
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { 
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id.toString(); // Ensure id is included as a string
      delete ret.password; // Don't send password in response
      return ret;
    }
  },
  toObject: { 
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id.toString(); // Ensure id is included as a string
      delete ret.password; // Don't include password in object
      return ret;
    }
  }
});

// Before saving, ensure the ID field is properly set
userSchema.pre('save', function(next) {
  if (!this.id) {
    this.id = this._id.toString();
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
