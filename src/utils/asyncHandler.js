const asyncHadler = (request) => {
     (req,res,next) => {
        Promise.resolve(request(req,res,next)).catch((err) => next(err))
     }
}//req basicallly ek func hai 

export default asyncHadler



//why-


//basically asyncHandler is a higher order fuction (those func. who can accept a function as a parameter) 


// 2nd method
// const asyncHadler = (fn) => async(req , res , next) => { //function me se extract ki req,res,middleqre
//     try {
//         await fn(req,res,next)
//     } catch (error) {
//         res.status(err.code || 500).json({
//             success: false,
//             message: err .message
//         })
//     }
// }