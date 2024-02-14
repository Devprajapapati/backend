import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


const connectDB = async() => {
    try {
       const connectionInstance =  await mongoose.connect(`${process.env.MONGODB_URL}-${DB_NAME}`)
       console.log(`\n MongoDB connected !! DB HOST : ${connectionInstance.connection.host}`)//basically ye hamne isliya kiya kyoki kabhi kabhi daatabse koi aur server se connect ho jata hai  sliye use host ka connection.host
    } catch (error) {
   
        console.log("database connection :: db :: index.js ",error)
        process.exit(1)// process basically node ka part hai jo ya bata ha ki ye jo applicatio hai kisi currenct processs pe cahlri hai or process uska refernce hai
    }
}

export default connectDB