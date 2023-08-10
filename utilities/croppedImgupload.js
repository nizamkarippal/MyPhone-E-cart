const multer=require("multer");

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        
      cb(null, 'public/img/users')
    },
    filename: function (req, file, cb) {
      cb(null, `${req.body.name}_${Date.now()}.jpeg`)
    }
})
var upload = multer({ storage: storage });

module.exports = upload;