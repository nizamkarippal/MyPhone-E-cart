const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
      customer:{
            type : mongoose.Types.ObjectId,
            ref:"user-Collection",
      },
      totalPrice : Number,
      totalQuantity : Number,
      products : [
            {
                  name:{
                        type: mongoose.Types.ObjectId,
                        ref: "product_collection",
                  },
                  quantity:{
                        type:Number,
                        default :1,
                        min:1,
                  },
                  ramCapacity : String,
                 romCapacity : String,
                  price:Number,

            },
      ],
});

const cartCollection = new mongoose.model("Cart-collection", cartSchema);


module.exports=cartCollection