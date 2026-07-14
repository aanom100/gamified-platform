import multer from 'multer';
import{v2 as cloudinary} from 'cloudinary';
import{CloudinaryStorage} from 'multer-storage-cloudinary';
import dotenv from 'dotenv';


dotenv.config();
// 👉 ADD THIS LINE TO TEST:
console.log("My Cloudinary Key is:", process.env.CLOUDINARY_API_KEY);
//Give cloudinary your keys and info saved in env file
cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
})

//setup bridge
const storage=new CloudinaryStorage({
    cloudinary:cloudinary,
    params:{
        folder:'gamified_academy_submissions',
        resource_type:'auto',//auto allows images,videos,raw files
        allowed_formats:['jpg','png','jpeg','mp4','pdf','zip']
    }
})

//create the multer interceptor
const upload=multer({storage:storage})

export default upload;