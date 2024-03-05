
import mongoose from "mongoose"
import { User } from "../models/user.models.js"
import { Vedio } from "../models/vedio.models.js"
import apiError from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import { Like } from "../models/like.models.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const obj ={}
   const vediodetails  = await User.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup:{
                from:"vedios",
                localField:"_id",
                foreignField:"owner",
                as:"totalvedios"
            }
        },
        
 
        {
            $addFields:{
                totalvedios:"$totalvedios"
            }
        },
        {
            $unwind:"$totalvedios"
        },
        {
            $group:{
                _id:"$_id",
                totalvedios:{
                    $sum:1
                } ,
                totalviews:{
                    $sum:"$totalvedios.views"
                },
                totalsubsciber:{
                    $sum:"$subscriber"
                },
              
          }
        },
   
        
    ])
    const likesdetails = await Vedio.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup:{
                from:"likes",
                localField:"_id",
                foreignField:"vedio",
                as:"totallikes"
            }
        },
        {
            $unwind:"$totallikes"
        },
        {
            $count:"totallikes"
        }
     
    ])


    obj["vediodetails"] = vediodetails;
    obj["likedetails"] = likesdetails;




    return res.json(
        new apiResponse(
            200,
            obj,
        )
    )
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
   const vedios = await Vedio.find(
        {
            owner:req.user?._id
        }
    )

    if(!(vedios || vedios.length >0)){
        return res.status(200).json(
            new apiResponse(
                200,
                "not published yet"
            )
        )
    }

    return res.status(200).json(
        new apiResponse(
            200,
            vedios,
            "published vedios are yet"
        )
    )





})

export {
    getChannelStats, 
    getChannelVideos
    }