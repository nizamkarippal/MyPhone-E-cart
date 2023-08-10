// require('dotenv').config()
const userCLTN = require('../../model/userschema');
const cartCLTN = require('../../model/cartShema');
const mongoose = require('mongoose');
const couponCLTN = require('../../model/admin/couponSchema');
const orderCLTN = require('../../model/orderSchema');
const productCLTN = require('../../model/admin/productSchema');
const sendMail = require('../../utilities/nodeMailer');
const razorpay = require("razorpay");
const session = require('express-session');

//razor pay configuration
const razorpayInstance = new razorpay({
    key_id: process.env.RZP_KEY_ID,
    key_secret: process.env.RZP_KEY_SECRET,
  });
// check Out view
exports.view = async(req,res)=>{
try{
    const usersId = req.session.userData._id;
    const currentUser = await userCLTN.findById(usersId);
    const userCart = await cartCLTN.findOne({customer:currentUser._id})
    .populate({
        path:'products.name',
        populate:{
            path:'brand',
            model:'brands-collections'
        }
    });
    
    let cartCount = 0
            if(userCart){
                
                for(let i=0;i<userCart.products.length;i++){
                    cartCount += userCart.products[i].quantity
                }

            };

    const products = await userCart.products;
    if(products.totalQuantity != 0){
        let allAddresses = await userCLTN.findOne({_id:currentUser._id});
        allAddresses = allAddresses.addresses;

        let defaultAddress = await userCLTN.aggregate([
            { $match : {_id:new mongoose.Types.ObjectId(currentUser._id)} },
            {$unwind: '$addresses'},
            {$match:{'addresses.primary':true}},
            {$project:{address:'$addresses'}}

        ]);
        if(defaultAddress != ""){
            defaultAddress = defaultAddress[0].address;
        }else{
            defaultAddress = 0;
        }
        res.render('userview/userprofile.ejs/partials/checkOut',{
           cartCount,
           userData:req.session.userData,
           currentUser,
           defaultAddress,
           products,
           userCart,
           allAddresses
        })
    }
}
catch(err){
    console.log("Error in checkout page", err);  // log error to console
    res.render('404Error')
}
}

// checking coupon validitty
exports.coupon = async(req,res)=>{
    try{
        const couponCode = req.body.couponCode;
        const userCart = await cartCLTN.findOne({customer:req.session.userData._id})
        .populate('products.name');

        const cartPrice = userCart.totalPrice;
        if(couponCode == ''){
            res.json({
                data:{
                    couponCode:null,
                    discountPrice:0,
                    discountPercentage:0,
                    finalPrice:cartPrice
                }
            })
        };

        let couponCheck = '';
        let discountPrice = 0;
        let finalPrice = cartPrice;

        const coupon = await couponCLTN.findOne({code:couponCode});
        

         if(coupon){
            const couponBrands = coupon.brand;
            const couponProducts = coupon.product;
            
            // check if coupon is applicable or not based on product and category
            let isApplicable = false;
            userCart.products.forEach((product, i) => {
                  for(let i = 0; i < couponProducts.length; i++){
                        if(product.name._id.equals(couponProducts[i]) || product.name.brand.equals(couponBrands)){
                              isApplicable = true;
                              return;
                        }
                  }
            });
            
            const alreadyUsedCoupon = await userCLTN.findOne({
                  _id : req.session.userData._id,
                  couponsUsed : coupon._id,
            });
            //if coupon applicable
            if(isApplicable){
                  // id coupon is not used check coupons status, and validity
                  if(!alreadyUsedCoupon){
                        if(coupon.active == true){
                              // toJSON()returns JSON complaint string re[resentation]
                              const currentTime = new Date().toJSON();
                              if(currentTime > coupon.startingDate.toJSON()){
                                    if(currentTime < coupon.expiryDate.toJSON()){
                                          discountPrice = coupon.discount;
                                          finalPrice = cartPrice - discountPrice;
                                          //coupon applied Case
                                          couponCheck = 
                                                 '<b>Coupon Applied <i class="fa fa-check text-success" aria-hidden="true"></i></b></br>' +
                                                 coupon.name;
                                    } else{
                                          couponCheck =
                                                "<b style='font-size:0.75rem; color: red'>Coupon expired<i class='fa fa-stopwatch'></i></b>";
                                    }
                              }else{
                                    couponCheck = 
                                                `<b style='font-size:0.75rem; color: green'>Coupon starts on </b><br/><p style="font-size:0.75rem;">${coupon.startingDate}</p>`;
                              }
                        }else{
                              couponCheck =
                                          "<b style='font-size:0.75rem; color: red'>Invalid Coupon !</i></b>";
                        }
                  }else{
                        couponCheck =
                                    "<b style='font-size:0.75rem; color: grey'>Coupon already used !</i></b>";
                  }
            }else{
                  couponCheck = "<b style='font-size:0.75rem; color :red'>Coupon is not applicable for this product</b>";
            }

      }else{
            couponCheck = "<b style='font-size:0.75rem; color :red'>Coupon not found</b>";
      }
      
      
          res.json({
            data:{
                  couponCheck,
                  discountPrice,
                  finalPrice,
            }
      });

         }

    catch(err){
        console.error(`Error while validating the Coupon ${err}`)
    }
}

// changing default address
exports.defaultAddress = async(req, res) => {
    try {
          const userId = req.session.userData._id;
          const defaultAddressId = req.body.DefaultAddress;
         
          // chnage existing default address to false
          await userCLTN.updateMany(
                {_id : userId, 'addresses.primary' : true},
                {$set: {'addresses.$.primary' : false}}
          );

          // change current default address to true

          await userCLTN.updateOne(
                {_id : userId, 'addresses._id' : defaultAddressId},
                {$set : {'addresses.$.primary' : true}}
          );

          res.redirect('/cart/checkout');
    } catch (error) {
          console.log('Error in Change Address : ' + error);
         
    }
}

// proceeding to place orders

let orderDetails ;
exports.checkOut = async(req,res)=>{
   
    
    try{
        // retrive the shipping address based on the req.body address_id
        let shippingAddress = await userCLTN.aggregate([
         { $match :{
            _id: new mongoose.Types.ObjectId(req.session.userData._id),
         }},
         {$unwind:'$addresses'},
         {$match :{'addresses._id':new mongoose.Types.ObjectId(req.body.addressID)}},
        ]);

        // addresses willbe am object inside shipping address array
        shippingAddress = shippingAddress[0].addresses;

        // coupon used 
        let couponUsed =await couponCLTN.findOne({code:req.body.couponCode,active:true});
        if(couponUsed){
            // checking validity of a coupon 
            const currentTime = new Date().toJSON();
            if(currentTime > couponUsed.startingDate.toJSON()){
                if(currentTime < couponUsed.expiryDate.toJSON()) { 
                    couponUsed = couponUsed._id;  
            }else{
                req.body.couponDiscount = 0;
            }
        }else{
            req.body.couponDiscount = 0;
        }
    }else{
        req.body.couponDiscount = 0;
    }
    if(!req.body.couponCode){
        req.body.couponDiscount=0;
        couponUsed = null;
    }
    req.session.couponUsed = couponUsed;

    // cart summary of user
    const orderSummary = await cartCLTN.aggregate([
        {$match:{customer: new mongoose.Types.ObjectId(req.session.userData._id)}},
        {$unwind : '$products'},
        {$project:{
            _id:0,
            product:'$products.name',
            quantity:'$products.quantity',
            totalPrice:'$products.price',
        },
    },
    ]);

     const userCart = await cartCLTN.findOne({customer:req.session.userData._id});

    // creating order
    orderDetails = {
        customer:req.session.userData._id,
        shippingAddress:{
            building:shippingAddress.building,
            area:shippingAddress.area,
            landmark:shippingAddress.landmark,
            city:shippingAddress.city,
            state:shippingAddress.state,
            country:shippingAddress.country,
            pincode:shippingAddress.pincode,
            contactNumber:shippingAddress.contactNumber
        },
        modeOfPayment:req.body.paymentMethod,
        couponUsed:couponUsed,
        summary:orderSummary,
        totalQuantity:userCart.totalQuantity,
        finalPrice:req.body.finalPrice,
        discountPrice:req.body.couponDiscount,
    };
    req.session.orderDetails = orderDetails;
    const transactionID = Math.floor(
        Math.random()*(1000000000000 - 10000000000) + 10000000000
    );
    req.session.transactionID = transactionID;
    // payments
    if(req.body.paymentMethod ==='COD'){
       
        res.redirect('/cart/checkout/' + transactionID)
      
            }
            else if (req.body.paymentMethod === "RazorPay") {
                const options = {
                  amount: orderDetails.finalPrice * 100, // paise to rupees
                  currency: "INR",
                  receipt: transactionID, //any unique id
                };
          
                razorpayInstance.orders.create(options, (error, order) => {
                  console.log(order);
          
                  if (error) {
                    console.log(error, "Error on razorpay");
                  } else {
                    console.log("success", order);
                    res.json({
                      order: JSON.stringify(order),
                    });
                  }
                });
              }
        }
     

    catch(err){
console.log('order placement error'+ err);
    }
}

// result in orderpalace
exports.result = async (req, res) => {
    try{
        let cartCount=0 ;
        
        
const usersId = req.session.userData._id;
const currentUser = await userCLTN.findById(usersId);


        if(req.session.transactionID){
            const couponUsed = req.session.couponUsed;


            req.session.transactionID = false;
           
            const orderDetails = new orderCLTN(req.session.orderDetails);
            await orderDetails.save();
           
            if(couponUsed){
                await userCLTN.findByIdAndUpdate(currentUser._id,{$push:{
                    orders:[new mongoose.Types.ObjectId(orderDetails)],
                    couponUsed:[couponUsed]
                }});
            }else{
                await userCLTN.findByIdAndUpdate(currentUser._id,{ $push :{
                    orders:[new mongoose.Types.ObjectId(orderDetails)],
                }
            });

        }
        await cartCLTN.findOneAndUpdate({customer:currentUser._id},
            {$set:{products:[],totalPrice:0,totalQuantity:0}});

        // reducing the stock of the product once the order is placed successfully
        const orders = req.session.orderDetails;
        
        for (const product of orders.summary) {
          try {
            
    
    const pricePerQuantity = product.totalPrice / product.quantity;
   

            await productCLTN.updateOne(
              {
                _id: product.product,
                "RAMROM.$.price": pricePerQuantity,
              },
              {
                $inc: {
                  "RAMROM.$.quantity": -1 * product.quantity,
                },
              }
            );
          } catch (error) {
            console.log( `yes it heppen ${error}`);
          }
        };

        
        // send email to user after orderplace
        const userSubject = `The expected delivery will be on ${new Date(
            new Date().getTime() + 7 * 3600 * 24 * 1000
          )} Thanks for Choosing MyPhone`;
          const adminSubject = `A new order has been placed by ${req.session.userData.email}`;
          //sending mail to uer
          sendMail(
            req.session.userData.email,
            userSubject,
            "placed",
            "users",
            orderDetails._id
          );
          //sending mail to admin
          sendMail(
            "myphonecart001@gmail.com",
            adminSubject,
            "placed",
            "admin",
            orderDetails._id
          );

        const orderResult = "Order Placed";
        res.render("userview/userprofile.ejs/partials/orderResult", {
          documentTitle: orderResult,
          userData:req.session.userData,
          cartCount,
          currentUser,
          orderID: orderDetails._id,
          orderResult,
        });
    }else {
        res.redirect("/cart/checkout");
      }
}
    catch(err){
       console.log('error in orderpace result page'+ err); 
    }
}
   
