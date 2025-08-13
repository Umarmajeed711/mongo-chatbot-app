
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import {CloudinaryStorage} from 'multer-storage-cloudinary';
import 'dotenv/config'


 console.log(process.env.Cloud_name ,process.env.Api_key, process.env.Api_secret);

cloudinary.config({ 
 
  
  cloud_name: process.env.Cloud_name, 
  api_key:  process.env.Api_key, 
  api_secret: process.env.Api_secret
});


const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder:'chat-app-images',
    // allowed_formats: ["jpg", "png", "jpeg", "webp"],
    // format: async (req, file) => 'png', // supports promises as well

  },
});

const upload = multer({storage:storage})

// export{
//     cloudinary,
//     storage
// }

export default upload;