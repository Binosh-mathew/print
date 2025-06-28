import mongoose from "mongoose";

const storeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    admin: {
      username: String,
      email: String,
      password: String, // store the bcrypt hash here
      createdAt: { type: Date, default: Date.now },
    },
    features: {
      binding: {
        isAvailable: { type: Boolean, default: true },
        spiralBinding: { type: Boolean, default: true },
        staplingBinding: { type: Boolean, default: true },
        hardcoverBinding: { type: Boolean, default: true },
      },
      availablePaperTypes: {
        normal: { type: Boolean, default: true },
        glossy: { type: Boolean, default: true },
        matte: { type: Boolean, default: true },
        transparent: { type: Boolean, default: true },
      },
      colorPrinting: { type: Boolean, default: true },
      blackAndWhitePrinting: { type: Boolean, default: true },
    },
    pricing: {
      blackAndWhite: {
        singleSided: { type: Number, default: 2 },
        doubleSided: { type: Number, default: 3 },
      },
      color: {
        singleSided: { type: Number, default: 5 },
        doubleSided: { type: Number, default: 8 },
      },
      binding: {
        spiralBinding: { type: Number, default: 30 },
        staplingBinding: { type: Number, default: 10 },
        hardcoverBinding: { type: Number, default: 100 },
      },
      paperTypes: {
        normal: { type: Number, default: 0 },
        glossy: { type: Number, default: 3 },
        matte: { type: Number, default: 2 },
        transparent: { type: Number, default: 5 },
      },
      lastUpdated: { type: Date, default: Date.now },
    },
  },
  { timestamps: true }
);

export const Store = mongoose.model("Store", storeSchema);
