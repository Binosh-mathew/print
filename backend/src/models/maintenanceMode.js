import mongoose from "mongoose";

const maintenanceModeSchema = new mongoose.Schema(
  {
    enabled: {
      type: Boolean,
      default: false,
    },
    message: {
      type: String,
      default: "System is currently under maintenance. Please try again later.",
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: {
      type: Date,
      default: null,
    },
    updatedBy: {
      type: String,
      default: "system",
    },
    reason: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// We'll use a singleton pattern since there should only be one maintenance mode state
maintenanceModeSchema.statics.getStatus = async function () {
  const status = await this.findOne({});
  if (status) {
    return status;
  }

  // If no status exists, create the default one
  return this.create({
    enabled: false,
    message: "System is currently under maintenance. Please try again later.",
    startTime: null,
    endTime: null,
    updatedBy: "system",
    reason: "",
  });
};

export const MaintenanceMode = mongoose.model(
  "MaintenanceMode",
  maintenanceModeSchema
);
