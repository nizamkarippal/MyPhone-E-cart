
const orderCLTN = require('../../model/orderSchema');
const moment = require('moment');
const orderReviewCLTN = require('../../model/orderReviewSchema');
const productCLTN = require('../../model/admin/productSchema');
const returnCLTN = require('../../model/returnSchema');
const mongoose = require('mongoose');
const sendMail = require('../../utilities/nodeMailer');
const { json } = require('express');

//view orders
exports.viewAll = async(req, res) => {
    try {
          const allOrders = await orderCLTN
                .find()
                .populate('customer', 'name email')
                .populate('couponUsed', 'name')
                .populate('summary.product', 'category name brand RAMROM')
                .populate('summary.product.category')
                .populate('summary.product.brand')
                .sort({_id : -1});

         const totalPrice = allOrders.map((order) => order.summary.reduce((total, value)=> total += value.totalPrice, 0));
         
          allOrders.price = totalPrice;
          res.render('adminview/partials/order', {
                // documentTitle : "MyPhone | eCommerce",
                session : req.session.admin,
                allOrders,
                
                moment,
                admin : req.admin,
          });
    } catch (error) {
          console.log("Error in Order Admin Page : " + error);
    }
};
// =====change order status ==========
// deliver order

exports.changeOrderStatus =async(req,res)=>{
      try{
            // update the data to ordercollection for all status
            await orderCLTN.findByIdAndUpdate(req.body.id,{
                  $set:{
                        // ture or false
                        delivered:req.body.delivered, 
                        // cancelled,returned,refunded,delivered,out for delivery, replaced 
                        status:req.body.status,
                        deliveredOn:req.body.deliveredOn,
                        // updatedBy:req.sesseion.admin?req.sesseion.admin.fname:req.session.manager.name,
                  }
            });
            const currentOrder = await orderCLTN.findById(req.body.id).populate('customer')
            const customerEmail = currentOrder.customer.email;
            // send email
            const adminSubject = `Order has been ${req.body.status} for user ${customerEmail}`;
            const userSubject = `Order has been ${req.body.status} succesfully Order ID : ${req.body.id}`;
            sendMail('myphonecart001@gmail.com',adminSubject,`${req.body.status}`,'admin',req.body.id);
            sendMail(`${customerEmail}`,userSubject,`${req.body.status}`,'users',req.body.id);


            // if status is refunded or cancelled  increase the  stock ,change access to review
            if(req.body.status === "Refunded"){
                  const currentOrder = await orderCLTN.findById(req.body.id);
                    
                  //return poduct details
                   
                  const productIds = currentOrder.summary.map((order) => order.product);
                  const quantity = currentOrder.summary.map((order) => order.quantity);
                  const price = currentOrder.summary.map((order) => order.totalPrice);

                   // customer id for changing review access
                   const userId = currentOrder.customer;
                   
                   // returned collection details for making isReturned to true.
                   const returnedProducts = await returnCLTN.findOne({customer : userId, isReturned :false});
                   const returnedProductId = returnedProducts._id; // document id
                   const producId = returnedProducts.product; //product id
                  //  increasing the stock once order is returned

                  for (let i=0; i<productIds.length; i++){
                        await productCLTN.updateOne({_id:productIds[i],'RAMROM.price':price[i]},
                        {$inc :{'RAMROM.$. quantity ': quantity[i]}});
                  };
                 

                  // change the return status to true
                  await returnCLTN.findByIdAndUpdate(returnedProductId,{
                        $set:{isReturned:true},
                  });
                  
                  res.json({data:{delivered :1}});



            }else{
                  // find the order by Id
                  const order = await orderCLTN.findById(req.body.id).populate('customer', 'name,email');

                  // extract product id and customer id
                  const productIds = order.summary.map(product => product.product);
                  const customerId = order.customer._id;

                  // insert data to the order reviewcltn when product is delivered
                  if(req.body.status === "Delivered"){
                        const orderReviews = productIds.map((productId)=>{
                          return new orderReviewCLTN({
                              customer:customerId,
                              product:productId,
                              delivered : true,
                          });    
                        });

                        await orderReviewCLTN.insertMany(orderReviews);
                  };
                  res.json({data:{delivered:1}});
            }

      }
      catch(err){
            console.log(`Error while changing the Status of an Order ${err}`) ;
      }
}

// view order details
exports.details = async(req, res) => {
      try {
            const currentOrder = await orderCLTN
                  .findById(req.params.id)
                  .populate('summary.product')
                  .populate('couponUsed');
            const totalPrice = currentOrder.summary.reduce((total, order) => total += order.totalPrice, 0);
            currentOrder.totalPrice = totalPrice;
            res.render('adminview/partials/orderDetails', {
                  session : req.session.admin,
                  moment,
                  currentOrder,
                  admin : true,
            });
      } catch (error) {
            console.log('Error in Order Details Page : ' + error);
      }
}

// admin cancel orders
exports.cancelOrder = async (req,res)=>{
   try{
      
        const orderDetails = await orderCLTN.findById(req.params.id);
        const productIds = orderDetails.summary.map((order)=>order.product);
        const quantity = orderDetails.summary.map((order)=>order.quantity);
        const price = orderDetails.summary.map((order)=>order.totalPrice);

        // increasing the count of product when cancelled
        for(let i=0; i<productIds.length; i++){
          await productCLTN.updateOne(
            { _id : productIds[i],'RAMROM.price':price[i] },
            {$inc:{ 'RAMROM.$. quantity ': quantity[i] }}
          );
        }

        await orderCLTN.findByIdAndUpdate(req.params.id,
            {$set:{
                status :"Cancelled",
                deliveredOn :null,
                updatedBy : req.session.admin?req.session.admin.fname:req.session.manager.name,
            }});

            res.json({
                success:{message:"cancelled"}
            });

            // const adminSubject = `Order has been cancelled by ${req.session.userData.email}`;
            // const userSubject = `Orders has been cancelled successfully Order ID : ${req.params.id}`;
            // sendMail ('myphonecart001@gmail.com', adminSubject, 'cancelled', 'admin', req.params.id);
            // sendMail(`${req.session.userData.email}`, userSubject, 'cancelled' ,'users', req.params.id );
   }
   catch(err){
      console.log("Cancel Orders Error "+ err )
   }
}

