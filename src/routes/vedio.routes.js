import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";

import { 
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    getAllVideos

} from "../controllers/vedio.controler.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

/*
 router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router
    .route("/")
    .get(getAllVideos)
    .post(
        upload.fields([
            {
                name: "videoFile",
                maxCount: 1,
            },
            {
                name: "thumbnail",
                maxCount: 1,
            },
            
        ]),
        publishAVideo
    );

router
    .route("/:videoId")
    .get(getVideoById)
    .delete(deleteVideo)
    .patch(upload.single("thumbnail"), updateVideo);

router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

*/

router.use(verifyJWT);
router.route('/').get(getAllVideos)
                 .post(upload.fields([
    {
        name:"vedio",
        maxCount:1
    },
    {
        name:"thumbnail",
        maxCount:1
    }
]),publishAVideo)

router.route('/:videoId').get(getVideoById)
                         .patch(upload.single("thumbnail"),updateVideo)
                         .delete(deleteVideo)

router.route('/toggle/publish/:videoId').get(togglePublishStatus)
export default router 
