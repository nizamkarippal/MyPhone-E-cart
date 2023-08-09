const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
      name : String,
      code : String,
      discount : Number,
      product :[ {   type: mongoose.Types.ObjectId,
                     ref: "product_collection",},],
      brand : {type : mongoose.Types.ObjectId, ref : "brands-collections"},
      startingDate : Date,
      expiryDate : Date,
      active: {
            type : Boolean,
            default : true,
      },
      updatedBy : String,
});

const couponCLTN = new mongoose.model("Coupons", couponSchema);

module.exports = couponCLTN;