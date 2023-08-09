const orderCLTN = require('../../model/orderSchema');
const cartCollection = require('../../model/cartShema');
const userCollection = require('../../model/userschema');
const productCLTN = require('../../model/admin/productSchema');
const returnCLTN = require('../../model/returnSchema')

const moment = require('moment');
const sendMail = require('../../utilities/nodeMailer');


// view orders page 
exports.viewAll = async( req, res) => {
    try {
        let cartCount=0
        
        let userCart=await cartCollection.findOne({customer:req.session?.userData?._id});
        if(userCart){
            for(let i=0;i<userCart.products.length;i++){
                cartCount+=userCart.products[i].quantity
            }

        }
const usersId = req.session.userData._id;
const currentUser = await userCollection.findById(usersId);
          // user's all orders
          const allOrders = await orderCLTN
                .find({customer : currentUser._id})
                .sort({_id : -1})
                .populate('customer')
                .populate('summary.product')
                .populate('couponUsed');
          res.render('userview/userprofile.ejs/partials/orders', {
            userData:req.session.userData,
                cartCount,
                currentUser,
                allOrders,
                moment,
          });

    } catch (error) {
          console.log('Error in View all Orders Page : ' + error);
    }
};

// view order details

exports.viewOrderDetails = async(req,res)=>{
    try{
        let cartCount=0
        
        let userCart=await cartCollection.findOne({customer:req.session?.userData?._id});
        if(userCart){
            for(let i=0;i<userCart.products.length;i++){
                cartCount+=userCart.products[i].quantity
            }

        }
        const usersId = req.session.userData._id;
        const currentUser = await userCollection.findById(usersId);

        const currentOrder = await orderCLTN.findOne({_id:req.params.id})
        .populate('summary.product')
        .populate('couponUsed')
        .sort("");

        const totalPrice = currentOrder.summary.reduce((total,order)=>total + order.totalPrice , 0);
        currentOrder.totalPrice = totalPrice;

        let allAddresses = await userCollection.findById(currentUser._id);
        allAddresses = allAddresses.addresses;

        if(currentOrder){
            res.render('userview/userprofile.ejs/partials/orderDetails',{
                cartCount,
                currentUser,
                userData:req.session.userData,
                documentTitle: "My Phone | eCommerce",
                currentOrder,
                moment,
                allAddresses,

            })
        }else{
            res.send("!!!Page is not fount");
        }

    }
    catch(err){
      console.log("error in orderDeatails page view" + err);
    }
}


// cancel order 
exports.cancelOrder = async(req,res)=>{
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
                status:"Cancelled",
                deliveredOn :null,
            }});

            res.json({
                success:{message:"cancelled"}
            });

            const adminSubject = `Order has been cancelled by ${req.session.userData.email}`;
            const userSubject = `Orders has been cancelled successfully Order ID : ${req.params.id}`;
            sendMail ('myphonecart001@gmail.com', adminSubject, 'cancelled', 'admin', req.params.id);
            sendMail(`${req.session.userData.email}`, userSubject, 'cancelled' ,'users', req.params.id );
            
    }
    catch(err){
        console.log(`Error while cancelling the Order ${err}`);
    }
}

//Return products

exports.returnOrder = async(req,res)=>{
    try{
        // insert return data to the return collection
        req.body.customer = req.session.userData._id;
        req.body.accountNo = req.body.accountNo[0];
        const newReturn = new returnCLTN(req.body);
        await newReturn.save();

        let status;
        if(req.body.action == "Replace"){
            status="Replace Requested"
        }else{
            status = "Returned"
        }
        // change status of product to returned from collection
        await orderCLTN.findByIdAndUpdate(req.body.orderId,{
            $set:{
                status : status,
                returnedOn : Date.now()
            }
        });
        // redirect to the order details page after return
        res.redirect(`/orders/${req.body.orderId}`)
    }
    catch(err){
        console.log(`return product error ${err}`);
    }
}