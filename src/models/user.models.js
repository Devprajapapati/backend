import mongoose,{Schema} from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new Schema(
    {
        watchHistory:[{
            type: Schema.Types.ObjectId,
            ref: "Vedio",
            
        },],
        username:{
            type: String,
            required:true,
            lowercase:true,
            unique:true,
            trim:true,
            index:true,
        },
        email:{
            type:String,
            required:true,
            lowercase:true,
            unique:true,
            trim:true,
        },
        password:{
            type:String,
            required: [true,"Password is required"],
            unique:true,
            trim:true,

        },
        fullName:{
            type:String,
            required:true,
            trim:true,
            index:true,
        },  
        avatar:{
            type : String, // cloudinary url
            required: true,
        },
        coverImage:{ 
            type:String,
        },
        refreshToken: {
            type: String,
        },
        subscriber:[
            {
                type:Schema.Types.ObjectId,
                ref:"User"
            }
        ],
        subscribeTo:[
            {
                type:Schema.Types.ObjectId,
                ref:"User"
            }
        ]
    }, {timestamps:true}
)





userSchema.pre("save",async function (next){
    // console.log(this.password)
    if(!this.isModified("password")) return next();
    this.password =await bcrypt.hash(this.password,10) //basically password encrpyt krre hai
    next()}) 

//abb basically me krr kya rha hu ki abb ham jo password check krre  hai vo hai encpted or user bhejr ahia 12,34 etc 
//uske liye ahm methods banate hai custom jo ayhi sab kuch check hojaye

//ham baiscally userschema me se methods lete hai aur usem isPaswordCoreect apna method abnaate hai
// console.log(passowrd)
//basically ye methods mere hai mongoose ke inbuilt ni hai to m access bhi inhe User se nahi balki apne user se hi krr paunga
userSchema.methods.isPasswordCorrect = async function(password){

    //compare method basically jo chheze mangta hai strng me pasword jo user bhejega and encrpyted password
    console.log(password)
    console.log(this.password)
   return await bcrypt.compare(password, this.password);
}
          
userSchema.methods.generateAccessToken =  function (){
    return jwt.sign(
        {
            _id : this._id,
            username: this.username,
            fullName : this.fullName,
            email: this.email,
        },
        process.env.ACCESS_TOKEN_SECRET ,
        {
            expiresIn : process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}


//basically ham authenticate hamesha krte hai acces token se hi
// par kabhi agar me access token expire hogya to ham rke hao refresh token

//refresh token is a token we we sent to a user and to store data f same id in db mtlb
//ham user ko bhi denge vo id and db me uss id denge abb hoga ye ki agar mera access token 
//expire hua to me refresh token id check krunga dono client and db and then  will generate a new accesss token



userSchema.methods.generateRefreshToken =  function (){
    return jwt.sign(
        {
            _id : this._id,

        },
        process.env.REFRESH_TOKEN_SECRET ,
        {
            expiresIn : process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User",userSchema)




 // bcrpytjs ->password to hash mtlb ham jo password dete hai vo string me deeta he to vahi sab krna ki decrpyt etc..



//jwt basically jason web token hote hai,, A JWT is often used for authentication and authorization purposes in web development.
//


//how jwt works:
/*
abb baiscally hota mostly ye login ke waqt h hota waise ye hai ki jab bhi me login krta hu phli baar to server merea dat check krega fir vo ek token generate krega jisme meri sari details hongi abb vo mujhe vo token dega as a cookie or localstorage or etc 
abb hog aye ki jb bhi me koi dusre page pe jaunga jisme login required hoga to j phle token diya tha server ne usme me secret code hota hai jise ham signature bolte hai 
abb jab dobara api req ya fr jarurat hoti hai uski to client hai vo uski token ko dobara bhejega server ko dobara req means dobara kabhi atta hu
abb imp ye hai  server jab phle use deta bhejra tha vo payload me th a and client usse cookie ya localstorage me save krra tha abb jabb cliwnt usse token bhejega to vo header me bhejega jo beareer se start hota hai
abb vo header jo hoga usse server recheck krega ki ye vahi oken to anhi jo maine use phli baar login ke waqt diya tjha agar haan to acces milega otherwse nahi...
abb sari check jo hogiuss secret code jisse ham signature bh bolte hai usse hogi...       
*/
// client jab token wapas layega and usko bhejega to vo http header me bhejega and signatue ko compare krega




/*

Absolutely, let's simplify it even more with a real-world analogy:

Imagine you're at a party, and you want to get into a VIP area. To prove you're invited, the organizer gives you a special wristband.

Header: This is like the type of wristband (e.g., "Access All Areas").
Payload: Inside the wristband, there's a small note with your name and other details (e.g., "John Doe, VIP Guest").
Signature: To make sure the wristband is valid, there's a secret stamp that only the organizer knows how to check.
Now, when you want to go to the VIP area:

Show Your Wristband: You show your wristband to the security.
Check the Type: They look at the type of wristband to make sure it's for the VIP area.
Read the Note: They read the note inside to confirm your identity and VIP status.
Verify the Stamp: They check the secret stamp to make sure it's a valid wristband.
In the digital world:

Header: Type of token (e.g., JWT).
Payload: Information about the user (e.g., user ID, role).
Signature: Ensures the token is valid and hasn't been tampered with.
So, a JWT is like a digital wristband that proves who you are and what access you have. You carry it with you (send it in requests) to access special areas (secure parts of a website or services). The server checks the wristband to make sure you're allowed in.

abb jab client pe jwt token jayega to vah useke pass header and payload vo decode form me hota hai par signature hamesha encoded h rhta hai isliye jab ham verify rkte hi to ham dobara secret key bhejte ha


When a server creates a JWT and sends it to a client, the server signs the JWT using its secret key. The server then sends the JWT, which includes the signature, to the client. The client can decode and read the information in the header and payload because those parts are base64url-encoded, but the signature remains encoded.
*/



// 3 parts hote hai jwt ke
/*
1.header->url hota hia
2.payoad->data hota hai
3.signature - security purpose  
*/