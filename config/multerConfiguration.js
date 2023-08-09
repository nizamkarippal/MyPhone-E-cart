const multer=require('multer')
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage }= require("multer-storage-cloudinary");

const productCloudstorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: "products",//cloud folder
    },
});


const uploadProducts = multer({
    storage: productCloudstorage,
    fileFilter:(req,file,callback)=>{//image validation for files other than required format,can avoid this  field if validain is not required
        if(file.mimetype=='image/jpeg'||file.mimetype=='image/jpg'||file.mimetype=='image/png'||file.mimetype=='image/gif'||file.mimetype=='image/avif'){
            callback(null,true)
        }
        else{
            callback(null,false)
            
            // return callback(new Error('only jpg jpeg png and gif file are allowed'))
        }
    }
})

const bannerCloudstorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: "banners",//cloud folder
    },
});

const uploadbanners = multer({
    storage: bannerCloudstorage,
    fileFilter:(req,file,callback)=>{//image validation for files other than required format,can avoid this  field if validain is not required
        if(file.mimetype=='image/jpeg'||file.mimetype=='image/jpg'||file.mimetype=='image/png'||file.mimetype=='image/gif'||file.mimetype=='image/avif'){
            callback(null,true)
        }
        else{
            callback(null,false)
            
            // return callback(new Error('only jpg jpeg png and gif file are allowed'))
        }
    }
})


module.exports = {
    uploadProducts,
   
    uploadbanners,
    uploadSingleBanner: uploadbanners.single('bannerFile'), // Define the 'single' file upload option
    
  };
    
    
