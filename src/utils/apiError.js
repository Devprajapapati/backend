
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