import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: {
    id: { type: mongoose.Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin', 'developer'], required: true }
  },
  recipient: {
    id: { type: mongoose.Schema.Types.ObjectId, required: false },
    name: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin', 'developer', 'store'], required: true }
  },
  content: { type: String, required: true },
  status: { type: String, enum: ['unread', 'read'], default: 'unread' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt timestamp before saving
messageSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const Message = mongoose.model('Message', messageSchema);
