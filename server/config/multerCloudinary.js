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
    allowedFormats : ['jpg' , 'png' , 'jpeg']
    }
})

const upload = multer({storage : storage ,
    limits : {
        fileSize : 1024 * 1024 * 2
    }
})

export default {upload,cloudinary};

