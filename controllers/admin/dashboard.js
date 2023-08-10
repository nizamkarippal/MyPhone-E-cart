const moment = require('moment');
const userCLTN = require('../../model/userschema');
const productCLTN = require('../../model/admin/productSchema');
const orderCLTN = require('../../model/orderSchema');
const { modelNames } = require('mongoose');



exports.view= async (req,res)=>{
   try{
    const recentOrders = await orderCLTN.find().sort({_id: -1}).populate('customer' , 'name email');
    const orderCount = recentOrders.length;
    const productCount = await productCLTN.countDocuments();
    const customerCount = await userCLTN.countDocuments();

    let totalRevenue = await orderCLTN.aggregate([
        {
            $match : { 
                delivered : true,
            },
        },
        {
            $group : {
            _id : 0,
            totalRevenue : {$sum :'$finalPrice'},
        },
    },
    ]);

    // Check if the totalRevenue array is not empty before accessing its property
    if (totalRevenue && totalRevenue.length > 0) {
      totalRevenue = totalRevenue[0].totalRevenue;
    } else {
      totalRevenue = 0;
    }
    res.render('adminview/partials/admindashbord',{
       session : req.session.admin,  //if you create manager you will update manager seession
       recentOrders,
       orderCount,
       productCount,
       customerCount,
       totalRevenue,
       documentTitle : 'Admin DashBoard / MyPhone',
       admin: req.admin,
    
    })
   }
   catch(err){
    console.log("Error in view orders", err);
   }
}

// chart data controller

exports.chartData = async (req,res)=>{
    try{
        let currentYear = new Date();
        currentYear = currentYear.getFullYear();

        // collection order data based on month and year
       const orderData = await orderCLTN.aggregate([
            {"$match" : {
                status : "Delivered"
            },
        },
        {'$project':{
            _id : 0,
            totalProducts : "$totalQuantity",
            billAmount : "$finalPrice",
            month : {
                $month:"$orderedOn",
            },
            year : {
                $year :"$orderedOn",
            }
        }},
        {$group : {
            _id : {month : "$month", year : "$year"},
            totalProducts : {$sum : "$totalProducts"},
            totalOrders : {$sum : 1},
            revenue : {$sum : "$billAmount"},
            avgBillperOrder : {$avg : "$billAmount"}
        },
    },{
        $match : {"_id.year" : currentYear},
    },{
        $sort : {"_id.month" : 1},
    },
       ]);

    //    dougnut chart initialization

    const today = moment().startOf('day'); //get the start of the current day
    const todayFormatted = today.format('YYYY-MM-DD'); //format of the date string

    let orders = await orderCLTN.aggregate([
        {$match : {
            orderedOn : {
                $gte : new Date((new Date().getTime() - ( 1 * 24 * 60 * 60 * 1000)))
            }
        }},{
            $group : {
                _id: "$status",
                status :{$sum : 1}, //sum count of document

            }
        },
    ]);
   
    let inTransit, cancelled , delivered , returnedOrders , refunded;
    orders.forEach((order , i )=>{
        if(order._id === "in-transit"){
            inTransit = order.status;
        }else if(order._id === "Cancelled"){
            cancelled = order.status ;
        }else if(order._id === "Delivered"){
            delivered= order.status ;
        }else if(order._id === "Refunded"){
            refunded = order.status ;
        }else{
            returnedOrders = order.status;
        }
    });

    res.json({
        data : {orderData,inTransit, cancelled , delivered , returnedOrders , refunded}
    });
    }
    catch(err){
      console.log(`error in chart page ${err}`);
    }
}

// select period for doughnut chart

exports.doughNutData = async(req,res)=>{
    try{
        const period = req.params.id;
        let orders = await orderCLTN.aggregate([
            { $match :{
                orderedOn : {
                    $gte : new Date((new Date().getTime() - ( period * 24 * 60 * 60 * 1000)))
                }
            }},
            {$group :{
                _id : "$status",
                status :{$sum :1},
            }},
        ]);
        

        let inTransit, cancelled , delivered , returnedOrders , refunded;
        orders.forEach((order , i )=>{
            if(order._id === "in-transit"){
                inTransit = order.status;
            }else if(order._id === "Cancelled"){
                cancelled = order.status ;
            }else if(order._id === "Delivered"){
                delivered= order.status ;
            }else if(order._id === "Refunded"){
                refunded = order.status ;
            }else{
                returnedOrders = order.status;
            }
        });
        
        res.json({
            data : {inTransit, cancelled , delivered , returnedOrders , refunded}
        });

    }
    catch(err){
        console.log("Error while fetching Doughnut Chart Data" + err);
    }
}
