const userCollection = require('../model/userschema')
const mongoose = require('mongoose');
const bcrypt =require('bcryptjs')
const categoryCLTN = require('../model/admin/categorySchema')
const productCLNS = require('../model/admin/productSchema')
const bannerCLTN = require('../model/admin/banarSchema')
const cartCollection = require('../model/cartShema')
const wishlistCollection = require('../model/wishlistSchema')
const otpfunctions = require('../config/otpConfigauration')




// home page
const home = async(req,res)=>{
    try{
        let cartCount=0
        
            let userCart=await cartCollection.findOne({customer:req.session?.userData?._id});
            if(userCart){
                for(let i=0;i<userCart.products.length;i++){
                    cartCount+=userCart.products[i].quantity
                    req.session.cartCount = cartCount
                }

            }
       
        let  currentUser = null;
        if(req.session.userData){
          
          currentUser =  await  userCollection.findById(req.session.userData._id);
        }
        const allproducts = await productCLNS.find({listed:true}).populate(['brand','category']).sort({_id:-1});
        let ios = [];
        let android = [];
        allproducts.forEach((product)=>{
            if(product.category._id == "64ae33d3caa3f7e98a0b7206"){
                ios.push(product);
            }
            else if(product.category._id =="64a6cb1adcbbc5f2e8d47149"){
                android.push(product) ;
            }
        });
        
        ios = ios.slice(0,4)
        android=android.slice(0,4)
        const newReleases = allproducts.slice(0,4)

        // product based on brands
        let samsung = [];
        let apple = [];
        allproducts.forEach(product =>{
           if(product.brand._id == "64a941c6c6b7b81fc1a67821"){
            samsung.push(product);
           }else if(product.brand._id == "64a941cfc6b7b81fc1a67827"){
            apple.push(product);
           }
        })
        samsung = samsung.slice(0,4);
        apple = apple.slice(0,4);

        const allBanners = await bannerCLTN.find({active:true}).limit(3);
        res.render('userview/UserHome',{
            userData:req.session.userData,

            session:req.session.userData,
            currentUser,
            cartCount ,
            ios,
            android,
            newReleases,
            samsung,
            apple,
            banners:allBanners
        })

        


    }
    catch(err){
        console.log('home page render'+err);
        res.render('404Error')
    }
}


//user login
const userLogin = async(req,res)=>{
try{
    let warning = req.query.warning
//    console.log(typeof(warning));

    res.render('userview/userloginpage',{userData:req.session.userData,warning})
}
catch(err){
    res.render('404Error')
}
}

//user login validation
 
const userValidation = async(req,res)=>{ 
    const inputPassword = req.body.password;
    const userData = await userCollection.findOne(
        { email: req.body.email }
        
      );
      if(!userData){
        res.redirect(`/login?warning=${true}`)
      }
        try{
            const hashedCheck = await bcrypt.compare(
                inputPassword,
                userData.password
          );
            if(hashedCheck){
                if(userData.access == false){
                    // console.log("access");
                    res.redirect(`/login?warning=${false}`)

                }else{
                    req.session.userData=userData
                    
                res.redirect('/')

                }
                
            }
            else{
                res.redirect(`/login?warning=${true}`)
            }
        }
        catch(err){
            console.log('login page error'+err);
            res.render('404Error')
        }
}


//user Registration
    const userRegistration = async(req,res) => {
        try{
            let warning = req.query.warning
            let catagoryData=await  categoryCLTN.find({isDeleted:false})
            res.render('userview/userRegistration',{userData:req.session.userData,warning,catagoryData})
        }
        catch(err){
            res.render('404Error')
        }
    }

    const userRegistrationOtp = async(req,res)=>{
        try{
            
            let user
           
            user = await userCollection.findOne({email:req.body.email})
            
            if(user){
                res.redirect(`/registration?warning=${true}`)
            }
            else{
                req.session.registrationData = {
                    
                    Name:req.body.Name,
                   
                    phonenumber:req.body.phonenumber,
                    email:req.body.email,
                    password:req.body.password
                }
                let otpgen=otpfunctions.otp()
            console.log(otpgen);
            let mailOptions=otpfunctions.mailObject(req.body.email,otpgen)
            otpfunctions.mailService(mailOptions)
            req.session.registrationData.otp= otpgen
            req.session.registrationData.expiry=Date.now()+60000
            res.render('userview/Otp',{
                warning : req.query.warning,
            });
            }
            
        }

          catch(err){
            console.log(err);
        res.render('404Error')
           }

        }
const userRegistrationOtpValidation = async(req,res)=>{
    try{
      
        let currentTime = Date.now()
        let expiryTime = req.session.registrationData.expiry
        let otp = req.session.registrationData.otp
       
        if(currentTime<=expiryTime && otp == req.body.otp) {
            const hashedPassword = await bcrypt.hash(req.session.registrationData.password, 10);
            await userCollection.insertMany([
                {
                    name:req.session.registrationData.Name,
                   
                    phonenumber:req.session.registrationData.phonenumber,
                    email:req.session.registrationData.email,
                    password:hashedPassword
                }
            ]);
            
            req.session.userData=req.session.registrationData
            
            req.session.registrationData=null
            res.redirect('/login')
            
             // intialising cart and wishlist collections when user sign up
             const newUserDetails = await  userCollection.findOne({email:req.session.userData.email});
             const userId = newUserDetails._id
             
             const newCart = await new cartCollection({
                   customer : new mongoose.Types.ObjectId(userId),
             });
             await userCollection.findByIdAndUpdate(userId, {
                   $set:{cart : new mongoose.Types.ObjectId(newCart._id)},
             });
             await newCart.save();
             // wishlist
             const newWishlist = await new wishlistCollection({
                   customer : new mongoose.Types.ObjectId(userId),
             });
             await userCollection.findByIdAndUpdate(userId, {
                   $set: {wishlist : new mongoose.Types.ObjectId(newWishlist._id)},
             });
             await newWishlist.save();
           

             
        }else if(otp !== req.body.otp){
            res.render('userview/Otp',{
                warning : "Invalid OTP",
            });
        }
    }
    catch(err){
        console.log(err);
        res.render('404Error')
    }
}
//forgot password 

const forgotPasswordPage = async(req,res)=>{
try{
    let warning = req.query.warning
    res.render('userview/forgetpassword',{warning})
}
catch (error) {
    console.log(error);
    res.render('404Error')
}
}
   
const forgotPasswordOtppage = async(req,res)=>{
    try{
        let userEmail = req.query.userEmail
        let userData  = await userCollection.findOne({email:userEmail})
        let warning = req.query.warning
        if(userData){
            if(!warning){
                let otpgen = otpfunctions.otp()
               
                let mailOptions = otpfunctions.mailObject(userEmail,otpgen)
                otpfunctions.mailService(mailOptions)
                req.session.forgotPasswordOtp=otpgen
                req.session.forgotPasswordOtpExpiry=Date.now()+60000
            }
            res.render('userview/forgotpasswordotppage',{userEmail,warning:req.query.warning})
        }
        else{
            res.redirect(`/forgotpassword?warning=${true}`)
        }
    }
    catch(err){
        res.render('404Error')
    }
    }


const forgotPasswordNewPasswordPage = async(req,res)=>{
    try{
        let currentTime = Date.now()
        let expiryTime = req.session.forgotPasswordOtpExpiry
        let otp = req.session.forgotPasswordOtp
        let userEmail = req.body.userEmail
        
        if(currentTime <= expiryTime && otp == req.body.otp){
            console.log(otp);
            res.render('userview/forgotpasswordNewPasswordPage',{userEmail})
        }
        else{
            res.redirect(`/forgotpassword/otppage?warning=${true}&userEmail=${userEmail}`)
        }
    }
    catch(err){
        console.log(err);
        res.render('./404Error')
    }
}

const forgotPasswordUpdation= async(req,res)=>{
    try{
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        await userCollection.updateOne({email:req.body.userEmail},{password:hashedPassword})
        req.session.userData = await userCollection.findOne({email:req.body.userEmail})
        res.redirect('/login')

    }
    catch(err){
        console.log(err);
        res.render('./404Error')
    }
}
const changePassword = async(req,res)=>{
    const userId= req.session.userData._id;
    const currentUser = await userCollection.findById(userId) ;
    let cartCount=0
    try{
       
        let userCart=await cartCollection.findOne({userId:req.session.userData._id})
        for(let i=0;i<userCart.products.length;i++){
            cartCount=cartCount+userCart.products[i].quantity
        }
    }
    catch(err){
        console.log(err);
    }
    res.render('userview/userchangepassword',{userData:req.session.userData,currentUser,cartCount})
}

const updatePassword = async(req,res)=>{
    try{
        const userId= req.session.userData._id;
        const currentUser = await userCollection.findById(userId) ;
        const hashedCheck = await bcrypt.compare(
            req.body.currentPassword,
            currentUser.password);

            if(hashedCheck ){
                const hashedPassword  = await bcrypt.hash(req.body.newPassword, 10);
                await userCollection.updateOne({_id:userId},{$set:{password : hashedPassword}})
                res.redirect('/profile')
               

            }else{
                res.render('./404Error')
            }
       
      
    }
    catch(err){
        console.log('error in update password'+ err );
        res.render('./404Error')
    }
    
}

//user loge out
const userLogout = async(req,res)=>{  //user login page
    try{
        req.session.destroy()
        res.redirect('/')
    }
    catch(err){
        console.log('loge Out not done yet'+err);
    }
}

//=======wishlist ==========
const viewAll = async(req,res)=>{
    try{
        let cartCount=0
        
        let userCart=await cartCollection.findOne({customer:req.session?.userData?._id});
        if(userCart){
            for(let i=0;i<userCart.products.length;i++){
                cartCount+=userCart.products[i].quantity
            }

        }
        
            const userWishlist = await wishlistCollection.findOne({customer:req.session.userData._id})
            .populate({
                path:'products',
                populate:{path:'brand',model:'brands-collections'}
            });
        res.render('userview/product-index/wishlist',{
            userData:req.session.userData,
            session : req.session.userId,
            userWishlist,
            cartCount

        }) 

        
        

    }
    catch(err){
        console.log("error view wishlist"+err);
        res.render('404Error')
    }
}
//whishlist add product from product single page
const addOrRemove = async(req,res)=>{
    try{
        const userWishlist = await wishlistCollection.findOne({customer:req.session.userData._id})
        if(userWishlist){
            const productExist = await wishlistCollection.findOne({_id:userWishlist._id,products:req.body.id})
            if(!productExist){
                await wishlistCollection.findByIdAndUpdate(userWishlist._id,{$push:{products:[req.body.id]}});
                res.json({
                    data :{
                          message : 1
                    }
              });
            }else{
                await wishlistCollection.findByIdAndUpdate(userWishlist._id, {
                      $pull : {
                            products : req.body.id
                      }
                });
                res.json({
                      data :{
                            message : 0
                      }
                });
          }
        }else{
            res.json({
                  data :{
                        message : null
                  }
            });
      }

    }
    catch(err){
        console.log(`Error in adding or removing ${err}`)
    }
}

//delete product form wishlist
// remove product from wishlist
const remove = async(req, res) => {
    try {
        const userWishlist = await wishlistCollection.findOne({customer:req.session.userData._id})
    
          await wishlistCollection.updateOne({
                _id:userWishlist._id,
          },{
                $pull:{
                      products : req.body.id
                }
          });
          
    
          res.json({
                data:{
                      deleted : true
                }
          });
    } catch (error) {
          console.log('Error in Remove From wishlist : ' + error);
    }
};

// =========cart= =page==========
//view cart
const viewcartAll = async(req,res)=>{
    try{
       const userCart = await cartCollection.findOne({customer:req.session.userData._id}) 
       .populate({path:'products.name',
        populate:{path:'brand',model:'brands-collections'}}).exec();
      
    
        const quantityInStock = userCart.products.map((item, i)=> item.name.RAMROM[0].quantity);

         res.render('userview/product-index/cart',{
            userData:req.session.userData,
             session : req.session.userId,
             quantityInStock,
            userCart,
            
        })
    }
    catch(err){
        console.log('error in cart page'+err);
        res.render('404Error')
    }
}



//add to cart page

const addToCart  =async(req,res)=>{
try{
    const userId = req.session.userData._id;
       let currentUser = null;
        if(req.session.userData){
            // let user_Id = req.session.userData._id;
          currentUser =  await  userCollection.findById(userId);
        }
    
    const productId  = req.body.id;
    const price = parseInt(req.body.price);
    const ramCapacity = req.body.ramCapacity;
    const romCapacity = req.body.romCapacity;

    //check if product in stock
    const productToAdd = await productCLNS.findOne({_id:productId,'RAMROM.price':price});
   
    let isProductInStock = productToAdd.RAMROM.find((ramrom)=>ramrom.price == price);
    isProductInStock = isProductInStock.quantity;
    

    //current cart  quantity
    let quantityInCart = await cartCollection.findOne({customer : currentUser._id, 'products.name': productId, 'products.ramCapacity' : ramCapacity});
   
    if(quantityInCart){
        quantityInCart = quantityInCart.products.find((product)=>product.ramCapacity == ramCapacity);
        quantityInCart = quantityInCart.quantity;
    }
   

    //checking enough stock
    if(isProductInStock > quantityInCart){

    // checking product present in wishlist
    const wishlistCheck = await wishlistCollection.findOne({
        customer:currentUser._id,
        products:new mongoose.Types.ObjectId(productId),});
      
    if(wishlistCheck){
        await wishlistCollection.findByIdAndUpdate(wishlistCheck._id,//particular user wishlist documment
            {$pull:{products:productId}}) ;
    }
    
   const userCart= await cartCollection.findOne({customer:currentUser._id}) ;
  
//    const product = await productCLNS.findOne({_id: productId});
   //check product exist in cart or not
   const productExist = await cartCollection.findOne({_id:userCart._id,
   products:{$elemMatch:{name:new mongoose.Types.ObjectId(productId),ramCapacity:ramCapacity}}});

   if(productExist){
    
       await cartCollection.updateOne({
        _id:userCart._id,
        products:{$elemMatch:{name:new mongoose.Types.ObjectId(productId),ramCapacity:ramCapacity}}},
    { $inc:{
        'products.$.quantity' : 1,
        totalPrice : price,
        totalQuantity : 1,
        'products.$.price' : price
  },});
  

  res.json({
    success:'countAdded',
    message : 1,
   });

   }else{

    await cartCollection.findByIdAndUpdate(userCart._id, {
          $push : {
                products : [
                      {
                            name: new mongoose.Types.ObjectId(productId),
                            price : price,
                            ramCapacity : ramCapacity,
                            romCapacity: romCapacity,
                      },
                ]
          },
          $inc : {
                totalPrice :price,
                totalQuantity : 1,
          } 
    });
    res.json({
        success : 'addedToCart',
        message : 1,
    });
}

}else{
    res.json({
        success : 'outOfStock',
        message : 0,
    });
}


}
catch(err){
    console.log("Add To Cart Error "+ err) ;
}
};

// remove product form cart
const removeCart = async(req,res)=>{
    try{
        const removeProductId = req.body.id;
        const userId = req.session.userData._id;
        const productToRemove = await cartCollection.aggregate([
            {
                  $match: {customer : new mongoose.Types.ObjectId(userId)}
            },
            {
                  $unwind : "$products"
            },
            {
                  $match : {'products._id' : new mongoose.Types.ObjectId(req.body.id)}
            },
      ]);
   
      await cartCollection.updateOne
            ({customer : new mongoose.Types.ObjectId(userId)}, 
                  {
                        $pull : {
                              products : {
                                    _id : new mongoose.Types.ObjectId(removeProductId),
                              },
                         },
                         $inc : {
                              totalPrice : -productToRemove[0].products.price,
                              totalQuantity : -productToRemove[0].products.quantity,
                         },
                  });
      res.json({
            success : 'removed'
      });
        
  }
 

    
    catch(err){
        console.log('remove cart error'+err);
    }
}

// ==========cout cart product quntites========
//add count

const addCount = async (req,res)=>{
    try{
        const productIdInCart = req.body.cartId;
        
        const userId = req.session?.userData?._id;
        
        const ramCapacity = req.body.ramCapacity;
        const productId = req.body.productId;

        const product = await productCLNS.findById(productId);
        const productPrice = product.RAMROM.find((item)=>item.ramCapacity == ramCapacity).price;

        // check stock
        const productToAdd = await productCLNS.findOne({_id: productId, 'RAMROM.price' : productPrice});
        let isProductInStock = productToAdd.RAMROM.find((ramrom)=>ramrom.price == productPrice).quantity;

        // current quntity in usercart
        let quantityInCart = await cartCollection.findOne({customer: userId,'products.name':productId});
        if(quantityInCart){
            quantityInCart = quantityInCart.products.find((product)=>product.ramCapacity == ramCapacity).quantity;
        }

        if(isProductInStock > quantityInCart){
            // update count in cart
            await cartCollection.findOneAndUpdate({
                customer:userId,
                products:{
                    $elemMatch:{_id: new mongoose.Types.ObjectId(productIdInCart)}},},
                    {
                        $inc:{
                            'products.$.quantity':1,
                            totalQuantity:1,
                            totalPrice:productPrice,
                            'products.$.price':productPrice,

                        }
                    });
                    const userCart = await cartCollection.findOne({
                        customer: userId
                    });
                    const allproducts = await userCart.products;
                    // current product
                    const currentProduct =allproducts.find((item)=> item._id == productIdInCart);
                    res.json({
                        data:{
                            message:'countAdded',
                            currentProduct,
                            userCart,
                        }
                    });

                }else{
                    res.json({
                        data:{
                            message:'outOfStock'
                        }
                    });
                }
            }
        
    
    catch(err){
        console.log("counting products"+ err) ;
        res.render('404Error')
    }
}

// reduce product count in cart
const reduceCount =async (req,res)=>{
    try{
        const cartId = req.body.cartId  ;
        const userId = req.session?.userData?._id;
        const currentProduct = await cartCollection.aggregate([
            {$match:{
                customer:new mongoose.Types.ObjectId(userId)
            }},{
                $unwind:'$products'
            },{
                $match :{
                    'products._id':new mongoose.Types.ObjectId(cartId)
                }
            }
        ]) ;

       
        const productPrice = currentProduct[0].products.price;  // all producut price
        const currentProductQuantity = currentProduct[0].products.quantity;
        const currentProductPrice = productPrice/currentProductQuantity;
        if(currentProductQuantity>1){
            await cartCollection.findOneAndUpdate({
                customer: new mongoose.Types.ObjectId(userId),
                'products._id':new mongoose.Types.ObjectId(cartId)
            },{
                $inc:{
                    'products.$.quantity':-1,
                    'products.$.price':-currentProductPrice,
                    totalPrice: -currentProductPrice,
                    totalQuantity:-1
                }
            });
        }
        const userCart = await cartCollection.findOne({customer: new mongoose.Types.ObjectId(userId)});
        const allProducts = await userCart.products;
        const currentItem = allProducts.find((item)=>item._id == cartId);
        res.json({
            data:{
                userCart,
                currentProduct: currentItem
            }
        });

    }
    catch(err){
        console.log('reduce count cart ='+ err);
    }
}

    

    
    

module.exports= {
    home,
    userLogin,
    userValidation,
    userRegistration,
    userRegistrationOtp ,
    userRegistrationOtpValidation,
    forgotPasswordPage,
    forgotPasswordOtppage,
    forgotPasswordNewPasswordPage,
    forgotPasswordUpdation,
    changePassword,
    updatePassword,
    userLogout,
    viewAll,
    addOrRemove,
    remove,
    viewcartAll,
    addToCart,
    removeCart,
    addCount,
    reduceCount
}




