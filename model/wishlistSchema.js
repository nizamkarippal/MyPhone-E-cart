const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
      customer : {
            type : mongoose.Types.ObjectId,
            ref : "user-Collection",
      },
      products: [{
            type: mongoose.Types.ObjectId,
            ref: "product_collection",
          }],   
});


const wishlistCLTN = new mongoose.model("Wishlist-Collections", wishlistSchema);
module.exports = wishlistCLTN;