import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from './cloudinary.js';

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    return {
      folder: 'printspark_uploads',
      resource_type: 'raw',
    };
  },
});

const upload = multer({ storage });

export default upload;
