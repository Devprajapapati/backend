import { User } from "../models/user.models.js";
import apiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"


export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        //abb kyoki frontend jo cooies ka data hai vo headers me bhjeta hai to vha se access krenge data
    
        //Whenever the user wants to access a protected route or resource, the user agent should send the JWT, typically in the Authorization header using the Bearer schema.
       // Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c


        const token = await req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        if (!token) {
            throw new apiError(401, "Unauthorized request")
        }
    
        // abb basicallly jo data atta hai vo encoded form me atta hai to vo hame decode krna padhta ha
    
        //abb decode sirf vo hi krr payega jab confirm hoga ki dono ki jo secret hai vo sam hai ki nahi
    
        const decode = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decode?._id).select("-password -refreshToken")
        if (!user) {
            throw new apiError(401, "invalid Access Token")
        }
    
        req.user = user;
        next();
    } catch (error) {
        throw new apiError(401,error?.message || "invalid access token")
    }
})