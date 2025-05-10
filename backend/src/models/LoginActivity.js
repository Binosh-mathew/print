const mongoose = require('mongoose');

const loginActivitySchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true
  },
  userRole: {
    type: String,
    enum: ['user', 'admin', 'developer'],
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'userModel'
  },
  userModel: {
    type: String,
    enum: ['User', 'Store', 'Developer'],
    required: true
  },
  action: {
    type: String,
    enum: ['login', 'logout', 'failed_attempt'],
    required: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['success', 'failed'],
    required: true
  },
  failureReason: {
    type: String
  }
});

module.exports = mongoose.model('LoginActivity', loginActivitySchema);
