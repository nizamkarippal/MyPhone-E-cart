const mongoose = require('mongoose');
const newschema = new mongoose.Schema({// define structre of collection
  name: {
    type : String,
    required : true,
},
  phonenumber:{
    type : Number,
    required : true,
},
  email :{
    type : String,
    required : true,
    unique:true,
},
password : {
  type : String,
  required : true,
},
  // age:Number,
  photo : {
    type:String,
    default:'default_userPhoto.jpg'
},
  access: {
    type : Boolean,
    default : true,
},
 
  addresses:[{
      building : String,
      area:String,
      landmark:String,
      city:String,
      state:String,
      country : String,
      contactNumber : String,
      pincode : Number,
      primary: Boolean,      
            
  }],
  cart : {
    type : mongoose.Types.ObjectId,
    ref : "Cart",
},
wishlist : {
    type : mongoose.Types.ObjectId,
    ref : "Wishlist",
},
orders : [
 {
    type : mongoose.Types.ObjectId,
    ref : "Orders",
 },
],
couponsUsed : [
    {
          type : mongoose.Types.ObjectId,
          ref : "Coupons",
    },
],


},{timestamps:true})
const userCollection = new mongoose.model('user-Collection',newschema)
module.exports=userCollection;

