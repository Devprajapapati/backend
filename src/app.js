import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'





const app = express()
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))


//middlleware set
//json acceptesd in app.use

// req middleare
//json limit - ki abb ham sari files json me thodi hi denge
app.use(express.json({limit:"16kb"}))

//ase hi url limit 
app.use(express.urlencoded({limit:"16kb",extended:true}))

//ase hi public files like images etc // alowed
app.use(express.static("public"))


//ccokie parser basically krte hai ye ki kaise me server se browser ki cookies excess krr pau basically crud operation perform krr pau cookie me
app.use(cookieParser()) 



//Routes import
import router from './routes/user.routes.js'

//routes declaration
//basically abb ham yha par middleare set krenge kyoki abb routes dusri file se ayenge to middleares set honge

// app.use('/users',router)

app.use('/api/v1/users',router)

// https://localhost: 8000/api/v1/users/register


export default app


// app.use is mostly used for middleware and configuration things


//middleware basically ek phase ya fir checkeer hota hai
//abb jaise hi req ayyi frontend se backend me to abb suno ki ajb req ayyi frontend se backednd me o ek chez beech me hoti ahi jo check krti hai ki app capable ho req lene ki ex. login hai ya nhai

// abb express me (err,req,res,next) -> jab bhi ham next ki baat krte hai iska mtlb ham midddleware ki baat krre hai