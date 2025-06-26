import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from './cloudinary.js';

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    // Determine resource type based on file mimetype
    const isVideo = file.mimetype.startsWith('video/');
    const isImage = file.mimetype.startsWith('image/');
    
    return {
      folder: isVideo ? 'printspark_videos' : 
             isImage ? 'printspark_images' : 
             'printspark_uploads',
      resource_type: isVideo ? 'video' : 
                     isImage ? 'image' : 
                     'auto',
      // Use filename as public_id (without extension)
      public_id: file.originalname.split('.')[0] + '_' + Date.now(),
    };
  },
});

const upload = multer({ storage });

export default upload;
