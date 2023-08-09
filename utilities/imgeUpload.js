const multer = require('multer')
// storing images uploaded in the buffer rather than in the disk sharp module will store it in the disk
const multerStorage = multer.memoryStorage();
// filtering upload image
const multerfilter = (req,file,cb)=>{
    if(file.mimetype.startsWith('image')){
        cb(null,true)
    }else{
        cb(console.log('Multer Filter: Must upload an image '), false);
    }
}
//calling the multer function
const upload = multer({
    storage : multerStorage,
    fileFilter: multerfilter

});
module.exports = upload;


