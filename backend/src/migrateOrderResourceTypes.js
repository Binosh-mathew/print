import mongoose from "mongoose";
import { Order } from "./models/Order.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Helper function to determine resource type from file path or original name
const guessResourceType = (file) => {
  // Check the folder to determine resource type
  if (file.fileName?.includes('printspark_videos') || file.publicId?.includes('printspark_videos')) {
    return 'video';
  }
  if (file.fileName?.includes('printspark_images') || file.publicId?.includes('printspark_images')) {
    return 'image';
  }
  
  // Check file extension from originalName
  if (file.originalName) {
    const ext = file.originalName.toLowerCase();
    if (ext.match(/\.(jpg|jpeg|png|gif|bmp|webp|svg)$/)) return 'image';
    if (ext.match(/\.(mp4|avi|mov|wmv|flv|webm)$/)) return 'video';
  }
  
  // Default to raw for documents and other files
  return 'raw';
};

async function migrateOrders() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Find all orders without resourceType in their files
    const orders = await Order.find({
      "files.resourceType": { $exists: false }
    });

    console.log(`Found ${orders.length} orders without resourceType`);

    let updatedCount = 0;
    let errorCount = 0;
    
    for (const order of orders) {
      try {
        let hasUpdates = false;
        
        // Update each file in the order
        for (const file of order.files) {
          if (!file.resourceType) {
            file.resourceType = guessResourceType(file);
            hasUpdates = true;
          }
        }

        // Save the order if any files were updated
        if (hasUpdates) {
          // Use validateBeforeSave: false to skip validation for orders with data issues
          await order.save({ validateBeforeSave: false });
          updatedCount++;
          console.log(`Updated order ${order._id}`);
        }
      } catch (error) {
        errorCount++;
        console.error(`Failed to update order ${order._id}:`, error.message);
        // Continue with next order instead of stopping
      }
    }

    console.log(`\nMigration complete!`);
    console.log(`✅ Successfully updated: ${updatedCount} orders`);
    if (errorCount > 0) {
      console.log(`⚠️  Failed to update: ${errorCount} orders (check logs above)`);
    }
    
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    // Close the MongoDB connection
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Run the migration
migrateOrders();
