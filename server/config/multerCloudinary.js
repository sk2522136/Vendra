import {v2 as cloudinary} from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer'


cloudinary.config({
    cloud_name :process.env.CLOUD_NAME,
    api_key : process.env.CLOUD_API_KEY,
    api_secret : process.env.CLOUD_API_SECRET
})


const storage = new CloudinaryStorage({
    cloudinary : cloudinary,
    params:{
    folder : 'Inventos',
    allowedFormats : ['jpg' , 'png' , 'jpeg','webp'],

    transformation: [
      { width: 1000, height: 1000, crop: 'limit' }, 
      { quality: 'auto:good' },                     
      { fetch_format: 'auto' }                      
    ]
    }
})

const upload = multer({storage : storage ,
    limits : {
        fileSize : 1024 * 1024 * 2
    }
})

export default {upload,cloudinary};

