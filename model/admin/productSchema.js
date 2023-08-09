const mongoose=require('mongoose')
const categoryCLTN = require('../admin/categorySchema');
const brandCLTN = require('../admin/brandSchema');
const productSchema = new mongoose.Schema({
      name: {
            type:String,
            require : true,
      },
      category :{
            type : mongoose.Types.ObjectId,
            ref:categoryCLTN,
            required : true,
      },
      brand : {
            type : mongoose.Types.ObjectId,
            ref:brandCLTN,
            required :true,
      },
      model : {
            type : String,
            required : true,
      },
      // salesPackage :{
      //       type : String,
      //       required:true,
      // },
      series:{
            type:String,
            required : true,
      },
      processor : {
            type : String,
            required:true,
      },
      RAMROM:[
            {
                  ramCapacity : {
                        type : String,
                        required : true,
                  },
                  romCapacity :{
                        type : String,
                        required : true,
                  },
                  price :{
                        type : Number,
                        required : true,
                  },
                  quantity :{
                        type : Number,
                        required : true,
                  },
            },
      ],
      operatingSystem : {
            type : String,
            required: true,
      },
      screenSize : {
            type : String,
            required : true,
      },
      warranty : {
            type : String,
            required: true,
      },
      display :{
        type : String,
        required: true,
      },
      camera :{
        type : String,
        required: true,
      },
      simtype :{
        type : String,
        required: true,
      },
      thumbnail:{
            type : String,
            required : true,
      },
      frontImage:{
            type:String,
            required : true,
      },
      images: [String],
     
    
      stock: Number,
      listed: { type: Boolean, default: true },
      updatedBy : String,
});

const productCLNS = new mongoose.model("product_collection", productSchema);
module.exports= productCLNS