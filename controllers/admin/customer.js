const userCollection = require('../../model/userschema')


exports.viewAll =async(req,res)=>{
    try{
        const allCustomers = await userCollection.find().sort({fname:-1})
        res.render('adminview/partials/customer',{
            documentTitle : "Customer Management | MyPhone",
            allCustomers,
            session: req.session.admin,
        });
    }catch(error){
        console.log('Error in Listing All User :' + error);
  }
}

exports.changeAccess = async(req,res)=>{
    try{
        console.log('user access-mangement');
        currentAccess = req.body.currentAccess;
        currentAccess = JSON.parse(currentAccess);
        currentAccess = !currentAccess;
        await userCollection.findByIdAndUpdate(req.body.userId,{access:currentAccess})
        console.log('Updated')
        res.json({
              data : {newAccess : currentAccess},
        })


    }
    catch(err){
        console.log("Error Changing User Access :" + err);
    }
}