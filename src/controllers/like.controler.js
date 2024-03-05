
import mongoose from "mongoose"
import { Like } from "../models/like.models.js"
import { Vedio } from "../models/vedio.models.js"
import apiError from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js"
import asyncHandler from '../utils/asyncHandler.js'


const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    // me check krunga ki vedio hai nahi hai
try {
    
        if(!videoId){
            throw new apiError(400,"vedio ID not found")
        }
    
        const videoFound = await Vedio.findById(videoId)
        if(!(videoFound && videoFound.isPublished)){
            throw new apiError(400,"vedio searching for lke not found")
        }
    
        const userAlreadyLiked = await Like.find({
            vedio: videoId,
            likedBy:req.user._id
        })
        console.log(userAlreadyLiked);
    
        if(userAlreadyLiked && userAlreadyLiked.length>0){
            await Like.findByIdAndDelete(videoId)
            
            return res.status(200).json(
                new apiResponse(
                    200,
                    "user have already liked a vedio so vedio disliked successfully"
                )
            )
        }
        
        const vedioLike =  await Like.create({
               likedBy:req.user?._id,
           vedio:videoId,
         })
        if(!vedioLike){
            throw new apiError(400,"unable to like a vedio")
        }
        return res.status(200).json(
             new apiResponse(
                 200,
                 vedioLike,
                 "u have liked this vedio"
             )
         )
} catch (error) {
    throw new apiError(401,error.message||"unable to like and dislike a vedio")
}


})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment

    try {
    
        if(!commentId){
            throw new apiError(400,"commentId  not found")
        }
    
        const commentFound = await Vedio.findById(commentId)
        if(!commentFound){
            throw new apiError(400,"comment searching for like not found")
        }
    
        const userAlreadyLiked = await Like.findOne({
            comment:commentId,
            likedBy:req.user?._id
        })
    
        if(userAlreadyLiked){
            await Like.findByIdAndDelete(commentId)
            
            return res.status(200).json(
                new apiResponse(
                    200,
                    "user have already liked a comment so comment disliked successfully"
                )
            )
        }
        
       const commentLike =  await Like.create({
            comment:commentId,
            likedBy:req.user?._id,
      
        })
        if(!commentLike){
            throw new apiError(400,"unable to like a comment")
        }
        return res.status(200).json(
            new apiResponse(
                200,
                commentLike,
                "u have liked this comment"
            )
        )
} catch (error) {
    throw new apiError(401,"unable to like and dislike a comment")
}

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet

    
    try {
    
        if(!tweetId){
            throw new apiError(400,"tweetId  not found")
        }
    
        const tweetFound = await Vedio.findById(tweetId)
        if(!tweetFound){
            throw new apiError(400,"tweet searching for like not found")
        }
    
        const userAlreadyLiked = await Like.findOne({
            tweet:tweetId,
            likedBy:req.user?._id
        })
    
        if(userAlreadyLiked){
            await Like.findByIdAndDelete(tweetId)
            
            return res.status(200).json(
                new apiResponse(
                    200,
                    "user have already liked a tweet so tweet disliked successfully"
                )
            )
        }
        
       const tweetLike =  await Like.create({
            tweet:tweetId,
            likedBy:req.user?._id,
      
        })
        if(!tweetLike){
            throw new apiError(400,"unable to like a tweet")
        }
        return res.status(200).json(
            new apiResponse(
                200,
                tweetLike,
                "u have liked this tweet"
            )
        )
} catch (error) {
    throw new apiError(401,"unable to like and dislike a tweet")
}

}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos

    //mre to modify
  try {
     const likedVedios = await Like.aggregate([
          {
              $match:{
                  likedBy:new mongoose.Types.ObjectId( req.user?._id)
              }
          },
          {
              $lookup:{
                  from:"vedios",
                  localField:"vedio",
                  foreignField:"_id",
                  as:"likedvedios"
              }
          },
          {
              $unwind:"$likedvedios"
          },
          {
            $match:{
              "likedvedios.isPublished" : true,
            }  
          },
          {
              $project:{
                  likedvedios :1
              }
          }
  
      ])
  
      if(!likedVedios)
      {
          return res.json(
              new apiResponse(
                  200,
                  "user have no liked vedios"
              )
          )
      }
  
      return res.status(200).json(
          new apiResponse(
              200,
              likedVedios,
              "liked vedios fetched successfully"
          )
      )
  } catch (error) {
    throw new apiError(401,"cannot get vedios"||error.message)
  }

    
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}