import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs'


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY,
})


const uploadOnCloudinary = async(localFilePath) => {
    try{
        if(!localFilePath){
            throw new Error('No file path provided')
        }
        //upload the file to cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
           resource_type: 'auto'
        })
        
        fs.unlinkSync(localFilePath)
        return response

    }catch(error){
        console.error('Error in uploadOnCloudinary:', error)
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath)
        }
        return null
    }
}



export {uploadOnCloudinary} 