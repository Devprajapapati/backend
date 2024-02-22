/*

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router
    .route("/c/:channelId")
    .get(getSubscribedChannels)
    .post(toggleSubscription);

router.route("/u/:subscriberId").get(getUserChannelSubscribers);*/

import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { 
    toggglesubscription,
    getsubscribedchannels,
    getuserchannelsubscriber,
    subscribeToaChannel,
    unsubscribeaChannel

} from "../controllers/subscription.controler.js";


const router = Router()

router.use(verifyJWT)

// router.route('/c/:channelId').post(toggglesubscription)
router.route('/c/:channelId').get(getsubscribedchannels)
router.route('/u/:subscriberId').get(getuserchannelsubscriber)
router.route('/c/:channelId/subscribe').post(subscribeToaChannel) 
router.route('/c/:channelId/unsubscribe').post(unsubscribeaChannel)



export default router