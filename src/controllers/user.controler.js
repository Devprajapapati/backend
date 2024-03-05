import asyncHandler from '../utils/asyncHandler.js'
import apiError from '../utils/apiError.js'

import { User} from '../models/user.models.js'  


import { deleteOnClodinary, uplaodOnCloudinary } from '../utils/cloudinary.js' 


import { apiResponse } from '../utils/apiResponse.js' 
import jwt from "jsonwebtoken"
import mongoose from 'mongoose'

const generateAceesAndRefreshTokens = async(userId) => {

    try{

    const user =await User.findById(userId);
     const accesToken =   user.generateAccessToken()
     const refreshToken =   user.generateRefreshToken()
        
     user. refreshToken = refreshToken
   
     await user.save({validateBeforeSave: false})

     return {accesToken,refreshToken}
    }
    catch(error){
        throw new apiError(500,"Somethng went wrong while generating access and frefresh token")
    }

    
}



const registerUser = asyncHandler(async(req,res) => {



    const {username,fullName,email,password} = req.body
    
    

    if(
        [fullName,email,username,password].some((feild)=> feild?.trim === " ")
    ){
        throw new apiError(400,"All feilds is required")
    }

    if(!email.includes("@")){
        throw new apiError(400,"@ is required")
    }



   const existedUSer = await User.findOne({
        $or: [{username},{email}]
    })
    if(existedUSer)
    {
        throw new apiError(409,"User or Email already existed")
    }



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

// console.log(req.files.avatar)
//  console.log("avatr:",req.files.avatar)
    const avatarLocalpath =  req.files?.avatar[0]?.path;
    // const coverImageLocalpath = req.files?.coverImage[0]?.path;
  
    if(!avatarLocalpath)
    {
        throw new apiError(400,"Avatar file is required")
    }


    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
       var coverImageLocalpath = req.files.coverImage[0].path;
    }


    //5.

    const avatar =  await uplaodOnCloudinary(avatarLocalpath)
    const coverImage =  await uplaodOnCloudinary(coverImageLocalpath)
    if(!avatar){
        throw new apiError(400,"Avatar  file is required")
    }


    //6

     const user =   await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || " ",
        email,
        password,
        username: username
    })

    // console.log("created user before findbyid:",user)

   const createdUser = await User.findById(user._id).select("-password -refreshToken") //return the wole response excluding 
//    console.log("created user:",createdUser)
   if(!createdUser)
   {
    throw new apiError(500,"Something went wrong while registering user")
   }


   // 8

   return res.status(201).json(
    new apiResponse(200,createdUser,"User regidterd succesfully")
   )

    




})




const loginUser = asyncHandler(async(req,res) => {


      //1.
      const {username,email,password} =  req.body
    
      //2.
      if(!(username || email))
      {
        throw new apiError(400,'username or email is required')
      }

      //3. 
      const existedUser =  await User.findOne({
        $or: [{username} ,{email}]
      })
  
         console.log(existedUser)
      if(!existedUser){
        throw new apiError(404,"Sign up first || user doen not exiseted")
      }   
    //   console.log(password)
      
    
      //3.  
      const isPasswordValid =  existedUser.isPasswordCorrect(password)

      if(!isPasswordValid){
        throw new apiError(404,"PAssword is invalid")
      }  

      //4.
     const {accesToken,refreshToken} =  await generateAceesAndRefreshTokens(existedUser._id)

     
     const loggesUser = await User.findById(existedUser._id).select("-password -refreshToken")



     const options = {
        httpOnly: true,
        secure : true
     }

   

     return res.status(200)
     .cookie("accessToken",accesToken,options)
     .cookie("refreshToken",refreshToken,options)
     .json(
        new apiResponse(
            200,
            {
                user: loggesUser,accesToken,refreshToken
            },
            "User logged in Successfully"
        )
     )
})

const logoutUser = asyncHandler(async(req,res) => {
    


 

  User.findByIdAndUpdate(
   await req.user._id,
    {
        $unset :{
            refreshToken: 1
        }
    },
    {
        new: true
    }
)
const options = {
    httpOnly: true,
    secure : true
 }
 return res.status(200).clearCookie("accessToken",options).clearCookie("refreshToken",options).json(new apiResponse(200,{},"userlogout"))
})

const refreshAccessTokenRegenrate = asyncHandler(async(req,res) => {

try {
    
            const token = req.cookie.refreshToken || req.body.refreshToken
    
            if(!token){
                throw new apiError(400,"invalid token")
            }
    
           const decodedUrl = jwt.verify(token,REFRESH_TOKEN_SECRET)
           const user =await User.findById(decodedUrl?._id)
    
         const {accesToken,refreshToken} = generateAceesAndRefreshTokens(user?._id)
    
         const options = {
            httpOnly:true,
            secure:true,
         }
    
         return res.status(200)
         .cookie("accessToken",accesToken,options)
         .cookie("refreshToken",refreshToken,options)
         .json(
            new apiResponse(
                200,
                {accesToken,refreshToken},
                "Token regenerated successfully"
            )
         )
} catch (error) {
    throw new apiError(401,error?.message || "invalid refresh token")
}

        


})    

const changeCureentPassword = asyncHandler(async(req,res) =>{ 

    const {oldpassword,newpassword} = req.body

 
 
    const currentUser = await User.findById(req.user?._id)
    // console.log("Existed user:",currentUser)
    if(!currentUser){
        throw new apiError(400,"Cannot find user")
    }

    const checkPassword = await currentUser.isPasswordCorrect(oldpassword)
    if(!checkPassword){
        throw new apiError(400,"Invalid old Password")
    }

    currentUser.password = newpassword;
   await currentUser.save({validateBeforeSave:false})

   return res.status(200).json(
    new apiResponse(
        200,
        "Password changed Successfully"
    )
   )


    


})

const getCurrentUser = asyncHandler(async(req,res)=>{
    return res.json(
        new apiResponse(        200,
            req.user,
            "cureent user found successfully")
    )
})

const updateAccountDetails = asyncHandler(async(req,res) => {

    const {fullName,email} = req.body

    if(!(fullName || email)){
        throw new apiError(400,"fullname and email required")
    }
  const current = await User.findByIdAndUpdate(req.user?._id,
    {
        $set: {
            fullName:fullName,
            email:email
        }
    },
    {new: true}).select("-password")

    return res.status(200).json(
        new apiResponse(
            200,
        current,
        "Account details updated successfully"
        )
    )


})

const updateUserAvatar = asyncHandler(async(req,res) => {
    
    const updatedAvatar =  req.file?.path
    // console.log(updatedAvatar);
    if(!updatedAvatar){
        throw new apiError(400,"updated avatar file localpath not found")
    }

    const avatar= await uplaodOnCloudinary(updatedAvatar)
    if(!avatar.url){
        throw new apiError(400,"updated avatar file when uploaded on cloudinary not found")
    }

    //previous image deleetion

    const localpath = await User.findById(req.user?._id).select("-password -refreshToken")
    console.log(localpath);
    if(!localpath){
        throw new apiError(400,"purani file does not found")
    }
    else{
        await deleteOnClodinary(localpath.avatar)
    }

   const userFound = await User.findByIdAndUpdate(req.user?._id,
        {
            $set: {
                avatar: avatar.url,
            }
        },
        {
            new: true
        }).select("-password")

        return res.status(200).json(
            new apiResponse(
                200,
                userFound,
                "updated avatar Successfully"
            )
        )
})

const updateUserCoverImage = asyncHandler(async(req,res) => {
    const coverImageLocalpath =  req.file?.path
    if(!coverImageLocalpath){
        throw new apiError(400,"updated coverImage file localpath not found")
    }

    const coverImage =  await uplaodOnCloudinary(coverImageLocalpath)
    if(!coverImage.url){
        throw new apiError(400,"updated coverImage file when uploaded on cloudinary not found")
    }

   const coverimage =  await User.findByIdAndUpdate(req.user?._id,
        {
            $set: {
                coverImage: coverImage
            }
        },
        {
            new:true
        }).select("-password")

        return res.status(200).json(
            new apiResponse(
                200,
                coverimage,
                "updated coverImage Successfully"
            )
        )
})

const getUserChannelProfile = asyncHandler(async(req,res)=>{
  
    const {username} = req.params
    if(!username?.trim()){
        throw new apiError(400,"username is missing")
    }

  const channel = await User.aggregate([
        {
            $match:{
                username:username
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscriber"
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscriberTo"
            }
        },
        {
           $addFields:{
            subscribedCount:{
                $size:"$subscriber"
            },
            channelSubscribedToCount:{
                $size:"$subsciberTo"
            },
            isSubscribed:{
                $cond:{
                    if:{$in: [req.user?._id,"$subscriber.subscriber"]},
                    then:true,
                    else:false
                }
            },
            
           },
         
        },
        {
            $project:{
                fullName:1,
                username:1,
                email:1,
                subscribedCount:1,
                channelSubscribedToCount:1,
                isSubscribed:1,
                avatar:1,
                coverImage:1,
            }
        }
    ])

    if(!channel?.length){
        throw new apiError(400,"Pipline not wotking channel doesnot exist")
    }
    return res.status(200).json(
        new apiResponse(
            200,
            channel[0],
            "user channel fetched succesfully"
        )
    )
})

const getWatchHistory = asyncHandler(async(req,res)=>{
   
   const user =  await User.aggregate([
    {
        $match:{
            _id: new mongoose.Types.ObjectId(req.user._id)
        }
    },
    {
        $lookup:{
            from:"vedios",
            localField:"_id",
            foreignField:"owner",
            as:"watchHistory",
            pipeline:[
                {
                    $lookup:{
                        from:"users",
                        localField:"owner",
                        foreignField:"_id",
                        as:"owner",
                        pipeline:[
                            {
                                $project:{
                                    fullName:1,
                                    username:1,
                                    avatar:1
                                }
                            }
                        ]
                    }
                },
                {
                    $addFields:{
                        owner:{
                            $first:"$owner"
                        }
                    }
                }
            ]
        }
    },
    ])

    return res.status(200).json(
        new apiResponse(
            200,
            user[0].watchHistory,
            "Wtach history fetched successfully"
        )
    )
})

export {loginUser , 
    registerUser,
    logoutUser,
    refreshAccessTokenRegenrate,
    getCurrentUser,
    updateAccountDetails,
    changeCureentPassword,
    updateUserAvatar,
    getUserChannelProfile,
    updateUserCoverImage,
    getWatchHistory,
    

}
