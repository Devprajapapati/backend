

import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { 
    
    getsubscribedchannels,
    getuserchannelsubscriber,
    subscribeToaChannel,
    unsubscribeaChannel

} from "../controllers/subscription.controler.js";


const router = Router()

router.use(verifyJWT)

router.route('/c/:channelId').get(getsubscribedchannels)
router.route('/u/:subscriberId').get(getuserchannelsubscriber)
router.route('/c/:channelId/subscribe').post(subscribeToaChannel) 
router.route('/c/:channelId/unsubscribe').post(unsubscribeaChannel)



export default router