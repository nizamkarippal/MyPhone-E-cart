const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
      customer : {
            type : mongoose.Types.ObjectId,
            ref : 'user-Collection',
      },
      product : {
            type : mongoose.Types.ObjectId,
            ref:'product_collection'
      },
      rating:{
            type:Number,
            min: 1,
            max : 5
      },
      review : {
            type : String,
      },
      createdAt: {
            type : Date,
            default : Date.now(),
      },
      helpful : {
            type : Number,
            default :1,
      },
});

const reviewCLTN = new mongoose.model("Review-Collections" , reviewSchema);
module.exports = reviewCLTN;