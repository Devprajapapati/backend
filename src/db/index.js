import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


const connectDB = async() => {
    try {
       const connectionInstance =  await mongoose.connect(`mongodb+srv://bustman:<db_password>@buster.wi5g0ln.mongodb.net/?retryWrites=true&w=majority&appName=buster`)
       console.log(`\n MongoDB connected !! DB HOST : ${connectionInstance.connection.host}`)
    } catch (error) {
   
        console.log("database connection :: db :: index.js ",error)
        process.exit(1)
    }
}

export default connectDB
