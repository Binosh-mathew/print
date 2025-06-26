import mongoose from "mongoose";

const adSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Ad title is required"],
    trim: true
  },
  description: {
    type: String,
    required: [true, "Ad description is required"]
  },
  videoUrl: {
    type: String,
    required: [true, "Ad video URL is required"]
  },
  thumbnailUrl: {
    type: String,
    required: [true, "Ad thumbnail URL is required"]
  },
  duration: {
    type: Number, // in seconds
    required: [true, "Ad duration is required"]
  },
  rewardCoins: {
    type: Number,
    required: [true, "Reward coins amount is required"],
    default: 5
  },
  active: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  // Media file details for uploaded files
  videoDetails: {
    publicId: String,
    format: String,
    size: Number
  },
  thumbnailDetails: {
    publicId: String,
    format: String,
    width: Number,
    height: Number
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

// Update the updatedAt field on save
adSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export const Ad = mongoose.model("Ad", adSchema);
