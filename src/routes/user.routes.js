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















