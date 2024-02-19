import asyncHandler from '../utils/asyncHandler.js'
import apiError from '../utils/apiError.js'

import { User} from '../models/user.models.js'   //since all models files are export and made by maongoose a part of mongodb
                                                 // so all models files acan drectly contact with the database


import { deleteOnClodinary, uplaodOnCloudinary } from '../utils/cloudinary.js' // now uplaod from cloudinary


import { apiResponse } from '../utils/apiResponse.js' //for rspponse

import jwt from "jsonwebtoken"
import mongoose from 'mongoose'

const generateAceesAndRefreshTokens = async(userId) => {

    try{

    const user =await User.findById(userId);
     const accesToken =   user.generateAccessToken()
     const refreshToken =   user.generateRefreshToken()
        
     user. refreshToken = refreshToken
     //abb jab hi ham usse save krenge to hoga ye ki kuch aur feild jo hamree user me nahi hai vo bhi add hojayengi
     await user.save({validateBeforeSave: false})

     return {accesToken,refreshToken}
    }
    catch(error){
        throw new apiError(500,"Somethng went wrong while generating access and frefresh token")
    }

    
}



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
    
    
    // console.log("request body:",req.body)
    // console.log("request headeer:",req.header)
    // console.log("Email:",password)
    


    //2.


    // if(fullName === ""){
    //     throw new apiError(400,"fullName is required")
    // }

    if(
        [fullName,email,username,password].some((feild)=> feild?.trim === " ")
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

   const existedUSer = await User.findOne({
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

    //7

    // abb basially hame check bhi karna hia sach me user create user create hua hai ki anhi
    // use ke liye mngodb hai
    // basically mongodb krta kya ki vo har ek entry ko ek id dega matlab har user ke liye ek specific id hogi
    // to ham abb usse check nahi balki usko find krenge by id is agar milta hai to agge badhemge varna nahi
    // achi baaat yeh hai ki agar user database me milla to ham vahi se password and refresh token hatayenge respnse me se akki jab vo dobara login kre vahi jwt ke liye i think


    // by default select me sare selected hote hai to ham basically ve feild dete hai jo hame nahi chaoye

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


/*
const registerUser =(req,res) => {
    return res.status(200).json({
        message: "ok"
    })
}

export default registerUser
 */


const loginUser = asyncHandler(async(req,res) => {
  /* mere:
     Todos:
     1.user ke pass access token hona chaiye
     2. user sign up hona hi chaoye accound bana hona chaiye agr nahi hai to banao
      3.user email,password feild ko khali na chodde
      4.agar bhaar diya hai to access token ki id match krni cahiye server ke pass jo secret hai
      5.agar match hai to login krdena hai
  */

      /* master ke:
      Todods:
      // req body - data
      // username or email
      // find the user
      // password check
      // access and refresh oken generate 
      // send it to user

      */

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
      
      // abb ye jo hai isPassordCorrect sba meere banaye hue method hai naki mingdb ke khdu ek to me
      //unhe ecess bhi khudhi karunga
 
      //3.  
      const isPasswordValid =  existedUser.isPasswordCorrect(password)

      if(!isPasswordValid){
        throw new apiError(404,"PAssword is invalid")
      }  

      //4.
     const {accesToken,refreshToken} =  await generateAceesAndRefreshTokens(existedUser._id)

     //abb basically usse objects me sa=se hamse bhot asri asi files bhi hogi jo hame vha nahi deni hai mtlb user ko

     const loggesUser = await User.findById(existedUser._id).select("-password -refreshToken")


     //5.
     //now about cookies

     // setting ki ham apni coolies ko sirf server se hi modify krenge to ye tab dalna padhta hai basically

     const options = {
        httpOnly: true,
        secure : true
     }

     // acces token and refresh cookie : basically cookie method ket valye pair leta hai

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
    

/*
Todods:
  1. remove all cookies
  2.refresh oken reset
*/

//1.
//phle me dikkat ye atti hai ki  bascialy user konsa dleete krna hai uski id to nhi haina
//use like ham aona khuhd ka middkeware design krenge basically hua ye tha ki jab ham cookeparser() middleware
// lagaya to ussse ham jo req ayyi hai uski bhi ccokie le skte hai mtlb abbb bande ne phle login kiya use pass cookie gyi haina fir dobara 
//ayya access token match hua to basically abb ham jaise hinreq atti hai vha se ham middleqare lgga denge aur user ka data utha lenege

//imp krre hai ye ki ham true login dekhenge middleare mtlb agar vahi banda dobara yya hai to ham usse data leelnge aur req.body me ek naya
//object add krdenge and vha se fill logout ka sysytem dekhenge

//basically me yha find by ud bhi use krrskte hai jaise hamne yha getAccessand 'refreshToken me ki bss wha par hame user me se refrresh token delete krnna hai

//set me basically ve cheez dete hai jo hame updqe krni hoti hai
 

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

      //basiclly refresh token hamare access token to refresh krne ke liye use kiya jaa hai hota ye hai ham accesss token
     // short lived hta hai o ham krte hai ki ek endpoint banate hai jab isse end point pe cheez pauche to hamara token refrgenerate hojaye
     // vo chhexx hai:

// abhi basically hamne ek controller banaya he jo reenerate krega naki endpoint diya hai endpoint route sme diya jayega
const refreshAccessTokenRegenrate = asyncHandler(async(req,res) => {
        //jwt verify hamesha decoded information deta ha\-
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

    // if(!newpassword === !confirmPassword)
    // {
    //     throw new apiError(400,"new and confirm password both are different")
    // }
 
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
    //querey parameter is different from path -> basically queerey params se ham log flterkrte hai and nomal :id se ham direct exact path dete hai
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
            //in jo hai vo basically objects ke aner bhi and array ke ander dono jaghe dekleta hai
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
    // req.user._id ->basically hame isse mongodb ki id ni mllti hame milti hai ek string par jab ham mongoose usee krte hai jo method lgata hai find etx unhe jab ussse krte hai to mongoose usse mongodb ki id me convert krta hai

    // abb basically hame watch history kiski chaiye hame chaiye uss user ki jo login krr chukka ho to tab ham usse krte hai

    // abb hame sub pipline kyu banai iska ye reason hai ki jab hamne ek pipline connectkrdi fir vo jo owner hai vo dependable ahi user pe vo usse watchhstory ke array ke ander object jo hoga usme nahi hoga vo
   const user =  await User.aggregate([
    {
        $match:{
            _id: new mongoose.Types.ObjectId(req.user._id)
        }
    },
    {
        $lookup:{
            from:"vedios",
            localField:"watchHistory",
            foreignField:"_id",
            as:"watchHistory",
            pipeline:[//bc hua ye ki abb ham chchte hai ki jo lookup ka data ham user me dalre hai usme owner bhi ayye isliye hamne k uske under lookup banaya abb basically jo ander wala lookup hoga uske ander user ka bhi to adata hoga isliye ham uski further reducee krre hai
                {//basically subpipline uske krne ka fyda yhi hai ki vo ssi object me include krdegi
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
