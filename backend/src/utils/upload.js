import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from './cloudinary.js';

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    // Determine resource type based on file mimetype
    const isVideo = file.mimetype.startsWith('video/');
    const isImage = file.mimetype.startsWith('image/');
    
    // Extract the file extension
    const fileExtension = file.originalname.split('.').pop();
    const fileNameWithoutExt = file.originalname.substring(0, file.originalname.lastIndexOf('.')) || file.originalname;
    
    return {
      folder: isVideo ? 'printspark_videos' : 
             isImage ? 'printspark_images' : 
             'printspark_uploads',
      resource_type: isVideo ? 'video' : 
                     isImage ? 'image' : 
                     'raw',
      // Include extension in public_id for raw files (documents)
      public_id: isVideo || isImage 
        ? `${fileNameWithoutExt}_${Date.now()}`
        : `${fileNameWithoutExt}_${Date.now()}.${fileExtension}`,
    };
  },
});

const upload = multer({ storage });

export default upload;
