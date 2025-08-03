// **************** My Cloudinary Service (Image Upload Service) Configs ****************

import dotenv from "dotenv";
dotenv.config();

import { v2 as cloudinary } from 'cloudinary';

// -> My cloudinary account
cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET
});

// const url=cloudinary.url("afqutl5qd12kfflyb0ke");


export default cloudinary;