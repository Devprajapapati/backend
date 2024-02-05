
//error ko standerised krne ke liye 
// ham basically overwriye krre hai errors ko jo npm ka ek package hai Error ko mtlb ham /error package se inherit krre hai aur usem kuch changes krre hai
class apiError extends Error{
    constructor(
        statusCode,//what kind of error , nature of error
        message = "Something went wrong",
        error = [],
        stack= "",//error lha ayya ha
         
    ){
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false,
        this.error = error


        if(stack){
            this.stack = stack
        }
        else{
            Error.captureStackTrace(this,this.constructor)
        }
    }
}
export default apiError