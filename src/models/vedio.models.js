import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const vedioSchema = new mongoose.Schema(
    {
        vedioFile: {
            type: String, // cloudinary url
            required: true,
        },
        thumbnail: {
            type: String,
            required:true,
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        duration: {
            type: Number,
            required: true,
        },
        views: {
            type: Number,
            required: true,
            default: 0,
        },
        isPublished: {
            type: Boolean,
            required: true,
            default: true,
        },
    },
    {
        timestamps: true,
    }
)

vedioSchema.plugin(mongooseAggregatePaginate) //abb kuch ageration pipline krna hai

export const Vedio = mongoose.model("Vedio",vedioSchema)


 // bcrpytjs ->password to hash mtlb ham jo password dete hai vo string me deeta he to vahi sab krna ki decrpyt etc..
