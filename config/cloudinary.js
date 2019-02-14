import cloudinary from 'cloudinary';
import cloudinaryStorage from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();
const { CLOUD_NAME, CLOUD_API_KEY, CLOUD_API_SECRET } = process.env;

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: CLOUD_API_KEY,
  api_secret: CLOUD_API_SECRET
});

const storage = (folder = 'articles') =>
  cloudinaryStorage({
    cloudinary,
    folder,
    allowedFormats: ['jpg', 'png'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }]
    //   filename(req, file, cb) {
    //     const { userId, id } = req.params;
    //     cb(undefined, userId || id);
    //   },
  });

export default storage;
