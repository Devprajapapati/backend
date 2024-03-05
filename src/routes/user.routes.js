import { Router } from "express";
const router = Router()
import {registerUser,
    loginUser,
    getWatchHistory,
    getUserChannelProfile,
    updateUserAvatar,
    getCurrentUser,
    changeCureentPassword,
    updateAccountDetails, 
    logoutUser,
    refreshAccessTokenRegenrate, 
    updateUserCoverImage}  
    from '../controllers/user.controler.js'
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";



router.route('/register').post(
    upload.fields([
        {
            name: "avatar",//file ko kis nam se janna hai
            maxCount:1

        },
        {
            name:"coverImage", 
            maxCount: 1
        }
    ]),
    registerUser)




router.route('/login').post(loginUser)

//scured routes
router.route('/logout').post(verifyJWT,logoutUser)
router.route("/refreshtoken").post(refreshAccessTokenRegenrate)
router.route('/changePassword').post(verifyJWT,changeCureentPassword)
router.route('/getcurrentUser').get(verifyJWT,getCurrentUser)
router.route('/updateInformation').patch(verifyJWT,updateAccountDetails)
router.route('/avatar-update').patch(verifyJWT,upload.single("avatar"),updateUserAvatar)
router.route('/coverImage-update').patch(verifyJWT, upload.single("coverImage"),updateUserCoverImage)
router.route('/c/:username').get(verifyJWT,getUserChannelProfile)
router.route('/WatchHistory').get(verifyJWT,getWatchHistory)

export default router
















/*
hOW MULTER MIDDLEARE WORKS:


Certainly! Let's simplify it:

In Your HTML Form:

You have a form on your website with various fields like email, username, avatar, and cover image.
Users can upload an image for their avatar and cover image.
Express Route Configuration:

In your server-side code (Express route), you use Multer middleware with upload.fields to say, "Hey, Multer, I'm expecting files for fields named 'avatar' and 'coverImage'."
You set a rule that each of these fields can only accept one file (maxCount: 1).
User Uploads Form:

When a user submits the form, Multer looks at the fields specified ('avatar' and 'coverImage') and processes the uploaded files.
It makes sure there's at most one file for each of these fields.
Accessing in Controller:

In your server-side code (controller), you can now access the uploaded files.
req.files['avatar'] gives you information about the uploaded avatar file.
req.files['coverImage'] gives you information about the uploaded cover image file.
You can also access other form fields like email and username using req.body.
In simple terms, Multer helps your server understand which parts of the form contain files, and you specify which fields can have files. After a user submits the form, you can easily get and handle the uploaded files in your server-side code.

*/