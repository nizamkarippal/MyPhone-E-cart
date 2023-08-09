const express = require('express')
const router = express.Router()

const signIn =require('../controllers/admin/singIn')
const dashboard = require('../controllers/admin/dashboard') 
const categories = require('../controllers/admin/categories')
const customer = require('../controllers/admin/customer')
const products = require('../controllers/admin/products')
const brands = require('../controllers/admin/brand')
const configUpload  =require('../config/multerConfiguration')
// const bannerUpload=configUpload.uploadbanners
const upload = require('../utilities/imgeUpload')
// const uploadSingleBanner =configUpload.uploadSingleBanner
const coupon = require('../controllers/admin/coupon');
const  order =  require('../controllers/admin/order');
const adminSession = require('../middlewares/adminSessionMW')
const accessCheck = require('../middlewares/adminAccessCheck')
const banner = require('../controllers/admin/banners')
const signOut = require('../controllers/admin/singOut')
const exportToExcel = require('../utilities/exportToExcel');


//-------admin sign in routes (page and verification)--------
router
      .route('/')
      .get(signIn.page)
      .post(signIn.adminVerification);

//  -------admin dashboard view--------   
 router
   .route('/dashboard')
   .get(adminSession,dashboard.view)

.put(adminSession, dashboard.chartData);

router.put('/dashboard/:id', adminSession, dashboard.doughNutData);

   // ====================== CATEGORIES ===========================//

// admin categories view and add new category routes
router
.route('/categories')
.get(adminSession, categories.view)
.post(adminSession, categories.addCategory);


// admin edit page and edit category route
router
      .route('/categories/edit')
      .get(adminSession, categories.editCategoryPage)
      .post(adminSession, categories.editCategory);

// admin delete category
router
      .route('/categories/delete_category')
      .get(adminSession, categories.deleteCategory);

      //==================== USERS =================================

// view and change access
router
.route('/customer_management')
.get(adminSession, customer.viewAll)
.patch(adminSession, customer.changeAccess)

// ====================== BRANDS ===========================//

// view brands page
router
      .route('/brands')
      .get(adminSession, brands.view)
      .post(adminSession, brands.addBrand);

      // edit brand 
router
.route('/brands/edit')
.get(adminSession, brands.editBrandPage)
.post(adminSession, brands.editBrand);

// delete brand
router
      .route('/brands/delete_brand')
      .get(adminSession, brands.deleteBrand);

// ====================== PRODUCTS ===========================//
router
      .route('/product_management')
      .get(adminSession, products.view);


      //Add product 
      router
      .route('/product_management/add_product')
      .post(adminSession, 
            // setting the fields to b uploaded and maximum count
            upload.fields([
                  {name:"frontImage", maxCount:1},
                  {name:"thumbnail", maxCount:1},
                  {name:"images", maxCount:3}
            ]),
             products.addProduct);



//Edit product

router
      .route('/product_management/edit')
      .get(adminSession, products.editPage)
      .post(
            adminSession, 
            upload.fields([
                  { name: "frontImage", maxCount: 1 },
                  { name: "thumbnail", maxCount: 1 },
                  { name: "images", maxCount: 3 },
                ]),
            products.editProduct
      );

//unlist product 
router
      .route('/product_management/changeListing')
      .get(adminSession, products.changeListing);


//======================= Bannar Manegement ==============================
// bannar view , add, block and unblock 

// view , add , delete, and update route
router 
      .route('/banner_management')
      .get(adminSession, banner.bannerPage)
      .post(adminSession, upload.single('image'), banner.addBanner)
      .patch(adminSession,  banner.changeActivity)
      .delete(adminSession, banner.deleteBanner);

// ================ COUPONS ===================================

// view coupon page
router.get('/coupon_management', accessCheck(["Coupon"]), coupon.page);

// //adding new coupon 
router.post('/coupon_management/addNew', accessCheck(["Coupon"]), coupon.addNew);
// edit coupon
router
      .route('/coupon_management/edit')
      .get(accessCheck(["Coupon"]), coupon.editCouponPage)
      .post(accessCheck(["Coupon"]), coupon.editCoupon);

// //change activity 
router.get('/coupon_management/changeActivity', accessCheck(["Coupon"]), coupon.changeActivity);

// ====================== ORDERS ===============================

//view all orders
router
      .route('/orders')
      .get(accessCheck(["Order"]), order.viewAll)
      .patch(accessCheck(["Order"]), order.changeOrderStatus);

router.patch('/orders/cancel/:id',accessCheck(["Order"]), order.cancelOrder);

router.get('/orders/:id', accessCheck(["Order"]), order.details);

// ====================== SALES REPORT =========================
router.get('/salesReport', exportToExcel.download);

//======================= LOG OUT ==============================
router.get('/signOut',adminSession, signOut.signOut);

module.exports= router



