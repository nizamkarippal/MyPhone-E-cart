const express = require('express')
const router = express.Router()
const croppedImgupload = require('../utilities/croppedImgupload')
const userController =require('../controllers/usercontroller')
const  userSession= require('../middlewares/userSessionMD')
const address = require('../controllers/userprofile/address')
const profile =require('../controllers/userprofile/profile');
const orders = require('../controllers/userprofile/orders');
const checkOut = require('../controllers/userprofile/ordercheckOut');
const review = require('../controllers/userprofile/review')
const userSessionMW=userSession.userSession

const withOutUserSessionMW=userSession.withOutUserSession


router.get('/',userController.home)
router.get('/login',userController.userLogin)
router.post('/login/validation',userController.userValidation)
router.get('/registration',withOutUserSessionMW,userController.userRegistration)
router.post('/registration/Otp',userController.userRegistrationOtp)
router.post('/registration/otpRecieved',userController.userRegistrationOtpValidation)
router.get('/forgotpassword',userController.forgotPasswordPage)
router.get('/forgotpassword/otppage',userController.forgotPasswordOtppage)
router.post('/forgotpassword/newpassword',userController.forgotPasswordNewPasswordPage)
router.post('/forgotpassword/passwordupdation',userController.forgotPasswordUpdation)
router.get('/change/password',userSessionMW,userController.changePassword)
router.post('/update/password',userSessionMW,userController.updatePassword)
router.get('/logout',userSessionMW,userController.userLogout)

//==================== User Profile Route ===============================
router
      .route('/profile')
      .get(userSessionMW,profile.profilePage)
      .post(
            userSessionMW,
            croppedImgupload.single("photo"),
            profile.updateProfile
      );  
 

//================ User Addresses Route =================================
router.get('/addresses', userSessionMW, address.viewAll)

// adding new address     
router.post('/addresses/addNew',userSessionMW, address.addNewAddress)

// edit existing address
router.post('/addresses/editAddress', userSessionMW, address.editAddress)

// deleting existing address
router.get('/addresses/delete', userSessionMW, address.deleteAddress);

// default address toggler
router.get('/addresses/changeRole', userSessionMW, address.defaultToggler);      

// ==================== WISH LIST MANAGEMENT ===============================
router.get('/wishlist',userSessionMW, userController.viewAll)
router.patch('/wishlist',userSessionMW, userController.addOrRemove)
router.delete('/wishlist', userController.remove);



// =================== CART MANAGEMENT =========================
router
      .route('/cart')
      .get(userSessionMW,  userController.viewcartAll)
      .post(userSessionMW, userController.addToCart)
      .delete(userSessionMW,userController.removeCart);

      // add and reduct count
router
.route('/cart/count')
.put(userSessionMW, userController.addCount)
.delete(userSessionMW, userController.reduceCount);


 // ============================= CHECK OUT =================================
router
.route('/cart/checkout')  
.get(userSessionMW, checkOut.view)
.put(userSessionMW, checkOut.coupon)
.post(userSessionMW, checkOut.checkOut);    

// changing default address 
router.post('/cart/checkout/changeDefaultAddress', userSessionMW, checkOut.defaultAddress);

// result page after payment
router.get('/cart/checkout/:id', checkOut.result);

//call back from razor pay
router.post('/cart/checkout/:id', async(req, res) => {
      const transactionID = req.params.id;
      res.redirect(`/cart/checkout/${transactionID}`);
});
      
//===================== ORDERS ==============================================
router.get('/orders', userSessionMW, orders.viewAll);


router
      .route('/orders/:id')
      .get(userSessionMW, orders.viewOrderDetails)
      .patch(userSessionMW, orders.cancelOrder)

// //return order  // pending
router
      .post('/orders/return', userSessionMW, orders.returnOrder);


      //=================== REVIEWS =============================================
router
.route('/reviews')
.post(userSessionMW, review.addNew)
.patch(userSessionMW, review.helpful);
      
module.exports = router




