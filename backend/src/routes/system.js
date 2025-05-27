import { Router } from "express";
import { isDeveloper } from "../middleware/roleCheck.js";
import { auth } from "../middleware/auth.js";
import os from "os";
import mongoose from "mongoose";
import {MaintenanceMode} from "../models/maintenanceMode.js";

const router = Router();

// Get system status (developer only)
router.get("/status", auth, isDeveloper, async (req, res) => {
  try {
    const status = {
      uptime: process.uptime(),
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        used: os.totalmem() - os.freemem(),
      },
      cpu: {
        cores: os.cpus().length,
        load: os.loadavg(),
      },
      platform: os.platform(),
      hostname: os.hostname(),
      mongodb: {
        status:
          mongoose.connection.readyState === 1 ? "connected" : "disconnected",
        collections: Object.keys(mongoose.connection.collections).length,
      },
    };
    res.json(status);
  } catch (error) {
    res.status(500).json({ message: "Error fetching system status", error });
  }
});

// Get database stats (developer only)
router.get("/database-stats", auth, isDeveloper, async (req, res) => {
  try {
    const stats = await mongoose.connection.db.stats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: "Error fetching database stats", error });
  }
});

// Get system logs (developer only)
router.get("/logs", auth, isDeveloper, async (req, res) => {
  try {
    // In a real application, you would implement proper log management
    // This is just a placeholder that returns recent console logs
    const logs = {
      message:
        "Log retrieval not implemented. Implement proper log management system.",
      timestamp: new Date(),
    };
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching logs", error });
  }
});

// Get maintenance mode status
router.get("/maintenance", async (req, res) => {
  try {
    const maintenanceStatus = await MaintenanceMode.getStatus();
    res.json({
      enabled: maintenanceStatus.enabled,
      message: maintenanceStatus.message,
      startTime: maintenanceStatus.startTime,
      endTime: maintenanceStatus.endTime,
      reason: maintenanceStatus.reason,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error fetching maintenance status",
        error: error.message,
      });
  }
});

// Enable/disable maintenance mode (developer only)
router.post("/maintenance", auth, isDeveloper, async (req, res) => {
  try {
    const { enabled, message, endTime, reason } = req.body;

    const maintenanceStatus = await MaintenanceMode.getStatus();

    maintenanceStatus.enabled =
      enabled !== undefined ? enabled : maintenanceStatus.enabled;
    maintenanceStatus.message = message || maintenanceStatus.message;
    maintenanceStatus.reason = reason || maintenanceStatus.reason;

    if (enabled) {
      maintenanceStatus.startTime = new Date();
      maintenanceStatus.endTime = endTime ? new Date(endTime) : null;
    } else {
      maintenanceStatus.endTime = new Date();
    }

    maintenanceStatus.updatedBy = req.user.id;

    await maintenanceStatus.save();

    res.json({
      status: "success",
      message: `Maintenance mode ${enabled ? "enabled" : "disabled"}`,
      maintenanceStatus,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error updating maintenance status",
        error: error.message,
      });
  }
});

export default router;
