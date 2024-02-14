
import multer from "multer"

const storage = multer.diskStorage({

    destination: function (req, file, cb) {
      cb(null, './public/temp')// sari files public folder me store rakhaa 
    },
    
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })
  
 export const upload = multer({ storage: storage })

  //multer isiliye use hota hai kyoki file bhi ani hai..mtlb ek req ayegi or ek file bhi ayegi
  //cb callbackv  