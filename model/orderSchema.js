const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
      customer : {
            type : mongoose.Types.ObjectId,
            ref : "user-Collection",
      },
      totalQuantity : Number,
      summary : [
            {
                  product : {
                        type : mongoose.Types.ObjectId,
                        ref : "product_collection",
                  },
                  quantity : Number,
                  totalPrice : Number,
            },
      ],
      shippingAddress : {
        building : String,
        area:String,
        landmark:String,
        city:String,
        state:String,
        country : String,
        contactNumber : Number,
        pincode : String,
      },
      delivered : { type : Boolean, default : false},
      status : {
            type : String,
            default : "In-transit",
      },
      modeOfPayment : String,
      couponUsed : {type : mongoose.Types.ObjectId, ref : "Coupons"},
      price : Number,
      finalPrice : Number,
      discountPrice : {type : Number, default : 0},
      orderedOn : {type : Date, default : new Date()},
      deliveredOn : {type : Date, default:null},
      returnedOn : {type : Date, default:null},
      updatedBy : String,
});

const orderCLTN = new mongoose.model('Orders', orderSchema);
module.exports = orderCLTN;


