import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'





const app = express()
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))



app.use(express.json({limit:"16kb"}))


app.use(express.urlencoded({limit:"16kb",extended:true}))

app.use(express.static("public"))

app.use(cookieParser()) 



//Routes import
import userrouter from './routes/user.routes.js'
import  subsrouter  from './routes/subscription.routes.js'
import vedios from './routes/vedio.routes.js'
import playlist from "./routes/playlist.routes.js"
import comment from "./routes/comment.routes.js"
import tweet from "./routes/tweet.routes.js"
import dashboard from "./routes/dashboard.routes.js"
import healthcheck from "./routes/healthcheck.routes.js"
import like from "./routes/like.routes.js"





app.use('/api/v1/users',userrouter)
app.use('/api/v1/subscription',subsrouter)
app.use('/api/v1/vedio',vedios)
app.use('/api/v1/playlist',playlist)
app.use('/api/v1/comment',comment)
app.use('/api/v1/tweet',tweet)
app.use('/api/v1/dashboard',dashboard)
app.use('/api/v1/healtcheck',healthcheck)
app.use('/api/v1/like',like)





// https://localhost: 8000/api/v1/users/register


export default app


