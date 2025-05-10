const mongoose = require('mongoose');

const loginActivitySchema = new mongoose.Schema({
  userName: String,
  userRole: String,
  timestamp: { type: Date, default: Date.now },
  ipAddress: String,
  action: String
});

module.exports = mongoose.model('LoginActivity', loginActivitySchema);
