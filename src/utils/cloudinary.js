import {v2 as cloudinary} from "cloudinary"
import fs from 'fs' 

import dotenv from "dotenv"
dotenv.config()
// file sysytem ding many function like read ,wriete,async etx etx


//unlink basically delete ka option hai isme basically ham uske isliye krte hai ki ek abr jab maine clodinary pe file upload krdi hai to abb main apne server se unlink krra rha hu

          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_API_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uplaodOnCloudinary = async(localFilePath) => {
    try {
        if(!localFilePath)  return "File cannot be uploaded";;

        //upload the file on clodinary
        

        console.log("Uploading file to Cloudinary. Local path:",localFilePath);
      const respoanse  =await cloudinary.uploader.upload(localFilePath,{
        resource_type: "auto",
      })


        //file have been uplaoded

        // console.log("File is uplaoded on cloudinary",respoanse.url)
        fs.unlinkSync(localFilePath)
        // console.log(respoanse)
        return respoanse
    } catch (error) {
       fs.unlinkSync(localFilePath) //remove the locally saved temporary file
      throw error
    }
}

export {uplaodOnCloudinary}