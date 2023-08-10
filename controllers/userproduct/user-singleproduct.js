const productCLTS = require('../../model/admin/productSchema');
const userCLTS = require('../../model/userschema')
const cartCLTS = require('../../model/cartShema')
const reviewCLTN = require('../../model/reviewSchema')
const wishlistCLTS = require('../../model/wishlistSchema')
const moment= require('moment')
const orderReviewCLTN = require('../../model/orderReviewSchema');
const couponCLTN = require('../../model/admin/couponSchema');

exports.view = async(req,res)=>{
    try{
       
        let cartCount=0
        
            let userCart=await cartCLTS.findOne({customer:req.session?.userData?._id});
            if(userCart){
                for(let i=0;i<userCart.products.length;i++){
                    cartCount+=userCart.products[i].quantity
                }

            };
           
            let currentUser = null;
            if(req.session.userData){
                currentUser = await userCLTS.findOne({_id:req.session.userData._id})
            };
           
        
        const productDetails = await productCLTS
        .findById(req.params.id)
        .populate(['category', 'brand']);
       

        const brandId = productDetails.brand._id;


        // for displaying available coupon in product page
        const coupons = await couponCLTN.find({
            $or: [
              { brand: brandId },
              { product: req.params.id }
            ],
            active : true,
          });
          
        let productExistInWishlist = null;
        if(currentUser){
              productExistInWishlist = await wishlistCLTS.findOne({
                    customer: currentUser._id,
                    products: { $in: [productDetails._id] },
                  });                      
              productExistInWishlist = productExistInWishlist ? productExistInWishlist.products : null;
        }

        let reviews = await reviewCLTN.find({product: productDetails._id}).sort({_createdAt:-1})
        .populate([{path :'customer',select :"name photo"}])
        const numberOfReviews = reviews.length;
        reviews = reviews.slice(0,5);
        if(reviews == ""){
            reviews = null;

        };

        const CategoryId = productDetails.category._id;
        let similarProducts = await productCLTS.find({'category':CategoryId}).populate(['category','brand']);
        similarProducts = similarProducts.filter((product)=>product.name != productDetails.name);
        const accessToReview = await orderReviewCLTN.findOne({customer:req.session?.userData?._id, product : req.params.id, deliverd : true});

        res.render('userview/singleProduct',{
            userData:req.session.userData,
            session : req.session.userId,
            documentTitle:productDetails.name,
            productDetails,
            currentUser,
            productExistInWishlist,
            reviews,
            numberOfReviews,
            similarProducts,
            moment,
            cartCount,
            accessToReview,
            coupons : coupons[0],
        });
     

   }
    catch(err){
        console.log('Error in single-Product Page' +err);
        res.render('404Error')
    }
}





// checking if product is listed or not
exports.listedCheck = async(req, res) => {
    
    const productId = req.body.id;
    
    const productDetails = await productCLTS.findById(productId);
    if(productDetails.listed){
          res.json({
                message:'listed',
          });
    } else{
          res.json({
                message : 'unlisted'
          });
    }
}





























