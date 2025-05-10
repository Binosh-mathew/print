const mongoose = require('mongoose');

const maintenanceLogSchema = new mongoose.Schema({
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  isEnabled: {
    type: Boolean,
    required: true
  },
  message: String,
  startTime: Date,
  endTime: Date,
  reason: String,
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Developer', // Only developers can change maintenance mode
    required: true
  },
  changedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('MaintenanceLog', maintenanceLogSchema); 