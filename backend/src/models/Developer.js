const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const developerSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['developer'],
    default: 'developer'
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  permissions: {
    canCreateAdmins: {
      type: Boolean,
      default: true
    },
    canManageSystem: {
      type: Boolean,
      default: true
    },
    canViewLogs: {
      type: Boolean,
      default: true
    },
    canManageDatabase: {
      type: Boolean,
      default: true
    }
  },
  lastLogin: {
    type: Date
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

developerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Developer', developerSchema); 