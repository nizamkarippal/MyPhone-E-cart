const mongoose = require('mongoose')
const newSchema = mongoose.Schema({
    fname:String,
    lname:String,
    email: {
        type: String,
        unique : true
  },
  password: {
        type:String,
        required : true
        
  },
})
const adminCLNC= new mongoose.model('admin_collection',newSchema)//creating collection using the defined schema and assign to new Model
module.exports = adminCLNC