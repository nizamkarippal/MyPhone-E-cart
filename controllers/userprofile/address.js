const cartCollection = require('../../model/cartShema');
const userCollection = require('../../model/userschema');

//address view page
exports.viewAll = async(req,res)=>{
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
    let allAddresses = currentUser.addresses;
    if(allAddresses == ''){
        allAddresses = null
    }
    res.render('userview/userprofile.ejs/partials/address',{
        allAddresses,
        currentUser,
        userData :req.session.userData,
        cartCount
    })
}
catch(err){
    console.log("Error in address View Page", err);
    res.render('404Error')
}
}
// add new address
exports.addNewAddress = async(req,res) => {
    try{
        const userId = req.session.userData._id;
        await  userCollection.updateMany(
            {_id : userId, 'addresses.primary' : true},
            {$set : {'addresses.$.primary' : false,}},
      );
      await  userCollection.updateOne(
        {_id:userId},
        {$push:{
            addresses:{
                building : req.body.building,
                area:req.body.area,
                landmark:req.body.landmark,
                city:req.body.city,
                state:req.body.state,
                country : req.body.country,
                contactNumber : req.body.contactNumber,
                pincode : req.body.pincode,
                primary: true,
            }
        }}
      );
      res.redirect('/addresses')

    }
    catch(error){
       console.log(error,"Failed to Add Address");
    }
}

//Edit address 
exports.editAddress = async(req,res)=>{
    try{
        const userId = req.session.userData._id;
        const addressId = req.query.addressID;
        await userCollection.updateOne(
            {_id:userId,'addresses._id':addressId},
            {$set:
            {'addresses.$.building':req.body.building,
            'addresses.$.area'   :req.body.area ,
            'addresses.$.landmark':req.body.landmark,
            'addresses.$.city'     :req.body.city      ,
            'addresses.$.state'    :req.body.state       ,
            'addresses.$.country'  :req.body.country    ,
            'addresses.$.contactNumber' :req.body.contactNumber          ,
            'addresses.$.pincode'       :req.body.pincode                ,
        } }
        );
        res.redirect('/addresses')
    }
    catch(error){
        console.log('edit address failed', error ) ;
    }
}

//delete address
exports.deleteAddress = async(req,res)=>{
    try{
        const userId = req.session.userData._id;
        const addressId = req.query.addressID;
        await userCollection.updateOne(
            {_id : userId},
            {$pull : {addresses : {_id : addressId}}}
      );
      res.redirect('/addresses');
    }
    catch(err){
      console.log("Delete Failed", err);
    }
}
//defult defult
exports.defaultToggler = async(req,res)=>{
    try{
        const userId = req.session.userData._id;
        const addressId = req.query.addressID;
            await userCollection.updateMany(
                  {_id : userId, 'addresses.primary' : true},
                  {$set: {'addresses.$.primary' : false}}
            );

            await userCollection.updateMany(
                  {_id : userId, 'addresses._id' : addressId},
                  {$set : {'addresses.$.primary' : true}}
            );

            res.redirect('/addresses');

    }
    catch(err){
      console.log('error in defult'+err);
    }
}
