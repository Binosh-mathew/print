import schedule from 'node-schedule';
import {cleanupOldOrderFiles} from './cleanupClaudinary.js'

export const initScheduledTasks = () => {
  // Run daily at 3:00 AM
  schedule.scheduleJob('0 14 * * *', async () => {
    console.log('Running scheduled Cloudinary cleanup task...');
    try {
      const stats = await cleanupOldOrderFiles();
      console.log('Scheduled Cloudinary cleanup completed successfully', stats);
    } catch (error) {
      console.error('Error in scheduled Cloudinary cleanup:', error);
    }
  });
  
  console.log('Scheduled tasks initialized');
};

export default { initScheduledTasks };