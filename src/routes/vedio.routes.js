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
