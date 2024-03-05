// whren connecting dtaabase wrapped it to in try catch or resolve reject
//database is always in another contient --mtlb time lagta hai that is async await lagega
//environment variable use file me upload kro jo first ho taki sabhi to jaldi vriable miljaye


import dotenv from "dotenv"
import connectDB from "./db/index.js";import app from "./app.js";
dotenv.config()// require('dotenv').config({path : './env})



 connectDB()
 .then(() => {

   app.listen(process.env.PORT || 8000,()=>{
     console.log(`🧿 Server is running at port : ${process.env.PORT}`)
   })
 })
 .catch((error) => {
   console.log("Mongo DB connection failed !! :: index.js ",console.error())
})






/* we will use another approch for database connection
require('dotenv').config({path : './env})
import express from 'express'
const app = express()

;(async () => {
    try {
       await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
       app.on("error",()=>{
        console.log("cannot talki to databaase ",error);
        throw error
       }) // dtabase to connect ho chuka hai par app hai vo baat ni krr paa rahi hai
      app.listen(process.env.PORT,() => {
        console.log(`App is listening on port ${process.env.PORT}`)
      })
    } catch (error) {
        console.log("database connection :: index.js ",error)
        throw error;
    }
})() //ifiy another approch for function

*/