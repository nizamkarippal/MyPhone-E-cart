const userCollection = require('../../model/userschema');
const cartCollection = require('../../model/cartShema');
const mongoose= require('mongoose');
 
// profile imge view
exports.profilePage = async(req,res)=>{
    try{
        let cartCount=0
        
        let userCart=await cartCollection.findOne({customer:req.session?.userData?._id});
        if(userCart){
            for(let i=0;i<userCart.products.length;i++){
                cartCount+=userCart.products[i].quantity
            }

        };
        const userId= req.session.userData._id;
        const currentUser = await userCollection.findById(userId) ;
        const defaultAddress =  await userCollection.aggregate([
            {$match:{_id : new mongoose.Types.ObjectId(userId)}},
            {
                $unwind:'$addresses'
            },
            {$match:{"addresses.primary":true}}]);
        res.render('userview/userprofile.ejs/partials/profile',{
        defaultAddress,
        currentUser,
        userData :req.session.userData,
        cartCount
        });
    
    }
    catch (error) {
        console.log("Error in Profile Page", error);
    }
}


//update profile and upload user image

 
exports.updateProfile = async (req,res)=>{
    try{
        
      const  userId =  req.session.userData._id;
      const newName = req.body.name;
      const newEmail = req.body.email;
      const newNumber  = req.body.phonenumber;
      const updateBody = {
        name:newName,
        email:newEmail,
        phonenumber:newNumber

      }

      if(req.file){
        updateBody.photo = req.file.filename;
      };

      await userCollection.findByIdAndUpdate(userId,updateBody);
      res.redirect('/profile');
    }
    catch(error){
        console.log('error in upload and update user profile =' + error);
    }
}

