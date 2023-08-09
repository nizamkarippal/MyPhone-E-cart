const couponCLTN = require('../../model/admin/couponSchema');
const brandCLTN = require('../../model/admin/brandSchema');
const productCLTN = require('../../model/admin/productSchema');
const moment = require('moment');


// view all coupons
exports.page = async(req, res) => {
    try {
          const coupons = await couponCLTN.find().populate(['product','brand']);


          // for brand and product based filtration
          const brands = await brandCLTN.find({isDeleted : false});
          const products = await productCLTN.find({isDeleted : false});

          res.render('adminview/partials/coupon', {
                session: req.session.admin || req.session.manager,
                documentTitle : 'Coupon Management | MyPhone',
                coupons,
                moment,
                brands,
                products,
                admin : req.admin,
          });

    } catch (error) {
          console.log('Error in Coupon Management Page '+error);
    }
};

// adding new coupon
exports.addNew = async(req,res) => {
    try {
          const selectedProducts = JSON.parse(req.body.selectedProducts);
         
          
          const newCoupon = new couponCLTN({
                name : req.body.name,
                code : req.body.code,
                discount : req.body.discount,
                product : selectedProducts,
                brand : req.body.brands ,
                startingDate : req.body.startingDate,
                expiryDate : req.body.expiryDate,
                updatedBy :  req.session.manager? req.session.manager.name : req.session.admin.fname,
          });
          await newCoupon.save();

          res.redirect('/admin/coupon_management');
    } catch (error) {
          console.log('Error in Adding new coupon : ' + error);
    }
};

//change activity
exports.changeActivity = async(req, res) => {
    try {
          const currentCoupon = await couponCLTN.findById(req.query.id);
          let currentActivity = currentCoupon.active;
          if(currentActivity == true){
                currentActivity = false;
          } else{
                currentActivity = true;
          }

          // converting current activity to boolean
          currentActivity = Boolean(currentActivity);
          await couponCLTN.findByIdAndUpdate(currentCoupon._id, {
                active: currentActivity ,
                updatedBy :  req.session.manager? req.session.manager.name : req.session.admin.name,
              });

          res.redirect('/admin/coupon_management');
    } catch (error) {
          console.log('Error in Change Activity Of Coupon ' + error);
    }
};

//edit coupon Page
exports.editCouponPage = async(req, res) => {
    try {
          const couponId = req.query.id;
          const currentCoupon = await couponCLTN.findById(couponId)
                                        .populate('product brand');
console.log(currentCoupon);
          const brands = await brandCLTN.find({isDeleted:false});

          const products = await productCLTN.find({isDeleted : false});
          
          res.render('adminview/partials/editcoupon', {
                coupon : currentCoupon,
                brands,
                products,
                moment,
                admin : req.admin,
          });
    } catch (error) {
          console.log("Error in edit coupon : " + error);
    }
};

// edit coupon post 
exports.editCoupon = async(req, res) => {
    try {
         const couponId = req.query.id;
         const selectedProducts = JSON.parse(req.body.selectedProducts);
         const {name, code, discount, brand, startingDate, expiryDate} = req.body;

         //updating in collection
         await couponCLTN.findByIdAndUpdate(couponId, {
          $set:{
                product : selectedProducts,
                name,
                code, 
                discount,
                brand,
                startingDate,
                expiryDate,
                updatedBy :  req.session.manager? req.session.manager.name : req.session.admin.name,
          }
         });

         res.redirect('/admin/coupon_management');
    } catch (error) {
          console.log("Error in edit coupon : " +error);
    }
}
