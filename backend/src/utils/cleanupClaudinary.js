import cloudinary from "./cloudinary";

function extractPublicIdFromUrl(url) {
  if (!url || typeof url !== 'string') return null;
  
  try {
    // Match pattern: /upload/v[version]/[public_id].[extension]
    const match = url.match(/\/upload\/(?:v\d+\/)?([^\.]+)/);
    return match ? match[1] : null;
  } catch (error) {
    console.error("Error extracting public ID:", error);
    return null;
  }
}

export const cleanupOldOrderFiles = async () => {
  try {
    console.log("Starting Cloudinary cleanup process...");
    
    // Calculate date 2 days ago
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    
    // Find eligible orders
    const eligibleOrders = await Order.find({
      status: { $in: ['completed', 'cancelled'] },
      updatedAt: { $lt: twoDaysAgo }
    });
    
    console.log(`Found ${eligibleOrders.length} eligible orders for cleanup`);
    
    // Track deletion stats
    let stats = {
      totalFilesToDelete: 0,
      successfullyDeleted: 0,
      failedDeletions: 0
    };
    
    // Use Promise.all for parallel processing of orders
    await Promise.all(eligibleOrders.map(async order => {
      // Skip if no files
      if (!order.files?.length) return;
      
      console.log(`Processing order ${order._id} with ${order.files.length} files`);
      
      // Process each file in the order with Promise.all for parallel deletions
      await Promise.all(order.files.map(async file => {
        if (!file.fileUrl) return;
        
        const publicId = extractPublicIdFromUrl(file.fileUrl);
        if (!publicId) return;
        
        stats.totalFilesToDelete++;
        try {
          // Delete file from Cloudinary
          const { result } = await cloudinary.uploader.destroy(publicId);
          
          if (result === 'ok') {
            stats.successfullyDeleted++;
            console.log(`Successfully deleted file: ${publicId}`);
          } else {
            stats.failedDeletions++;
            console.warn(`Failed to delete file: ${publicId}. Cloudinary response: ${result}`);
          }
        } catch (error) {
          stats.failedDeletions++;
          console.error(`Error deleting file ${publicId}:`, error);
        }
      }));
    }));
    
    console.log("Cloudinary cleanup completed:", stats);
    return stats;
  } catch (error) {
    console.error("Error in cleanupOldOrderFiles:", error);
    throw error;
  }
};

export default { cleanupOldOrderFiles, extractPublicIdFromUrl };