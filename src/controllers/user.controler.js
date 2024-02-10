import asyncHandler from '../utils/asyncHandler.js'
import apiError from '../utils/apiError.js'

//since all models files are export and made by maongoose a part of mongodb
// so all models files acan drectly contact with the database

import { User } from '../models/user.models.js'

// now uplaod from cloudinary

import { uplaodOnCloudinary } from '../utils/cloudinary.js'

// for response

import { apiResponse } from '../utils/apiResponse.js'

const registerUser = asyncHandler(async(req,res) => {
    /* 1.get informaion from fronened using postman , what are the information that is decided by user models
    2.validation -> sab chheeze deni zaruri hai
    3.check if user already exist :username,email
    4.chezk for images and avatar
    5.uplaod them to cloudinary,avtar check krna must hai kyuki hamne vo required bana rakha hai
    6.create user object - create enery in db
    7.Remove pssword and refresh token feild from respoanse
    8.check fro user creation 
    9.return res. 
    */



     /*jab frontend se data atta hai to vo req ki body me se liete hai ham backend me ex . 
     agar from or json se data arra hai to hme direct body me mill jayega varna agar url se atta hai
     to hma fr alag approch agate hai
    basically hame frontend se jo data mllega vo ham models se define krte hai
    */
    
    //1.

    const {username,fullName,email,password} = req.body
    // console.log("Email:",password)
    
    //2.

    // if(fullName === ""){
    //     throw new apiError(400,"fullName is required")
    // }

    if(
        [fullName,email,username,password].some((feild)=> feild?.trim === "")
    ){
        throw new apiError(400,"All feilds is required")
    }

    if(!email.includes("@")){
        throw new apiError(400,"@ is required")
    }


    //3.
    
    //check if user already existed
       // 1. used some database queries
       // 2. used operators exccessed through $ sign



    /*INFORMATION-> basically the model we made using schema act like a constructor to the name we give when we use .model thing
                    mtl ye ki jab ham .model usse krte hai t mtlb ham ek constructor bana rhe hai mtlb ek 
                    : The mongoose.model function creates a model based on the schema. The model is a constructor function that creates instances representing documents in the database.

                    abb since mongodb and mongoose connected hote kaise hai ekho : 
                    Mongoose is an Object Data Modeling (ODM) library for MongoDB and Node.js. It provides a higher-level abstraction over the MongoDB Node.js driver, making it easier to work with MongoDB databases in a Node.js environment.

                    man mudda ye hai ki jab bhi ham use name ko yh auser hai ko user kete ahi mtlb hamm basically ek 
                    
                    const newUser = new User({
                     name: 'John Doe',
                      email: 'john@example.com',
                      age: 25,
                    });

                    ye krte hai mtlb abb ham ye kha skte hai sab data jo ham modeling pe dete hai vha se ham usko exxcess krte hai

    */   

       //basic approach
    //  const existedUSerFound =   User.findOne({email}) // true or false return 
    //  if(existedUSerFound){
    //     throw new apiError(409,"email is already existed")
    //  }

    // to check all feild

   const existedUSer =  User.findOne({
        $or: [{username},{email}]
    })
    if(existedUSer)
    {
        throw new apiError(409,"User or Email already existed")
    }


    //4.
    
    //now through multer we can acces the files we stored earlier using files
    // ann dekho jab ham .feild usse krte hai to jo feil hai uske ander ek inbuilt thing ahi ki 
    // kis type ki file hai  .png,.jpg etc uske hisab se array banata hai to ahm yha o ndex pe jo type hai file ka vo access krenge


    /*  ex:
        req.files = {
  'avatar': [
    {
      fieldname: 'avatar',
      originalname: 'avatar1.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      size: 12345,
      destination: './public/temp',
      filename: 'avatar1.jpg',
      path: './public/temp/avatar1.jpg',
      buffer: <Buffer ...>
    },
    {
      fieldname: 'avatar',
      originalname: 'avatar2.png',
      encoding: '7bit',
      mimetype: 'image/png',
      size: 56789,
      destination: './public/temp',
      filename: 'avatar2.png',
      path: './public/temp/avatar2.png',
      buffer: <Buffer ...>
    },
    
    */


    const avatarLocalpath = req.files?.avatar[0]?.path;
    const coverImageLocalpath = req.files?.coverImage[0]?.path;
    // console.log("path:",avatarLocalpath)
  
    if(!avatarLocalpath)
    {
        throw new apiError(400,"Avatar file is required")
    }


    //5.

    const avatar =  await uplaodOnCloudinary(avatarLocalpath)
    const coverImage =  await uplaodOnCloudinary(coverImageLocalpath)
    if(!avatar){
        throw new apiError(400,"Avatar file is required")
    }


    //6

     const user =   await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowercase()
    })

    //7

    // abb basially hame check bhi karna hia sach me user create user create hua hai ki anhi
    // use ke liye mngodb hai
    // basically mongodb krta kya ki vo har ek entry ko ek id dega matlab har user ke liye ek specific id hogi
    // to ham abb usse check nahi balki usko find krenge by id is agar milta hai to agge badhemge varna nahi
    // achi baaat yeh hai ki agar user database me milla to ham vahi se password and refresh token hatayenge respnse me se akki jab vo dobara login kre vahi jwt ke liye i think


    // by default select me sare selected hote hai to ham basically ve feild dete hai jo hame nahi chaoye
   const createdUser = await User.findById(user._id).select("-password -refreshToken") //return the wole response excluding 

   if(!createdUser)
   {
    throw new apiError(500,"Something went wrong while registering user")
   }


   // 8

   return res.status(201).json(
    new apiResponse(200,createdUser,"User regidterd succesfully")
   )

    




})
export default registerUser

/*
const registerUser =(req,res) => {
    return res.status(200).json({
        message: "ok"
    })
}

export default registerUser
 */