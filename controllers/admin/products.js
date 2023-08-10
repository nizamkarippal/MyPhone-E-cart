const {default : mongoose} = require('mongoose');
const categoryCLTN = require('../../model/admin/categorySchema')
const productCLTN = require('../../model/admin/productSchema')
const brandCLTN = require('../../model/admin/brandSchema')


const sharp = require('sharp')


exports.view = async(req,res)=>{
try{
    const categories=await categoryCLTN.find({isDeleted:false});
    const brands = await brandCLTN.find({isDeleted:false});
    const products = await productCLTN.find().populate(['category','brand']);
    res.render('adminview/partials/product',{
        documentTitle:'Product Management | MyPhone',
                  session : req.session.admin,
                  categories : categories,
                  brands : brands,
                  products : products,
    });


}catch(err){
    console.log('Product Page rendering Error ' + error);
}
}
//add product
exports.addProduct = async(req,res)=>{
  
   
   
    try{
        const frontImage = `${req.body.name}_frontImage_${Date.now()}.png`;
        //using sharp module to process the image and convert it to png form and save it in the correct path and name
        
         sharp(req.files.frontImage[0].buffer)
         .toFormat('png')
         
         .png({quality:80})
         .toFile(`public/img/products/${frontImage}`);
   req.body.frontImage = frontImage;

    // thumbnail
    const thumbnail = `${req.body.name}_thumbnail_${Date.now()}.png`;
    sharp(req.files.thumbnail[0].buffer)
          .toFormat('png')
          
          .png({quality:80})
          .toFile(`public/img/products/${thumbnail}`);
    req.body.thumbnail = thumbnail;

     //other images 
     const newImages = [];
     for(let i = 0; i < 3; i++){
           const imageName = `${req.body.name}_image${i}_${Date.now()}.png`;
           sharp(req.files.images[i].buffer)
           .toFormat('png')
          
           .png({quality:80})
           .toFile(`public/img/products/${imageName}`);
           newImages.push(imageName);
     }
     req.body.images = newImages;

     req.body.category = new mongoose.Types.ObjectId(req.body.category);
     req.body.brand = new mongoose.Types.ObjectId(req.body.brand);
     // adding the price variants to a single array of object
     const ramCapacity = req.body.ramCapacity;
     const romCapacity = req.body.romCapacity;
     const combPrice = req.body.combPrice;
     const quantity = req.body.quantity;
     const RAMROM = [];
     for(let i = 0; i < ramCapacity.length; i++){
           RAMROM.push({
                 ramCapacity:ramCapacity[i],
                 romCapacity : romCapacity[i],
                 price:combPrice[i],
                 quantity :quantity[i],
           });
     }
     req.body.RAMROM = RAMROM;
     //fields inside req.body and collection fields should match with each other
     const newProduct = new productCLTN(req.body);
     await newProduct.save();

     console.log('Product added successfully');
     res.redirect('/admin/product_management');

    }
    catch(err){
        console.error("Error in adding Product "+ err)
    }
}



        
        
exports.editPage = async(req,res)=>{
    try{
        const categories = await categoryCLTN.find()
        const brands = await brandCLTN.find()
        const currentProduct = await productCLTN.findById(req.query.id).populate(['category','brand'])
        res.render('adminview/partials/editProducts',{
            session : req.session.admin,
            documentTitle : 'Edit Product | MyPhone',
            product : currentProduct,
            categories : categories,
            brands : brands
        })

    }
    catch(error){
        console.log('Product Editing GET error :' + error);
    }
}

//edit product
exports.editProduct = async(req,res)=>{
    try{
        if(Object.keys(req.files).length !==0){
            if(req.files.frontImage){
                const frontImage = `${req.body.name}_frontImage_${Date.now()}.png`;
                 // using sharp module for image formatting
                 sharp(req.files.frontImage[0].buffer)
                 .toFormat('png')
                 
                 .png({quality:80})
                 .toFile(`public/img/products/${frontImage}`);
           req.body.frontImage = frontImage;
            }
            if(req.files.thumbnail){
                const thumbnail = `${req.body.name}_thumbnail_${Date.now()}.png`;
                sharp(req.files.thumbnail[0].buffer)
                      .toFormat('png')
                      
                      .png({quality:80})
                      .toFile(`public/img/products/${thumbnail}`);
                req.body.thumbnail = thumbnail;

        }
        if(req.files.images){
            const newImages = [];
            for(let i = 0; i < 3; i++){
                  imageName = `${req.body.name}_image${i}_${Date.now()}.png`;
                  sharp(req.files.images[i].buffer)
                        .toFormat('png')
                        
                        .png({quality:80})
                        .toFile(`public/img/products/${imageName}`);
                  newImages.push(imageName);
            }
            req.body.images = newImages;
      }

    }
    const ramCapacity = req.body.ramCapacity;
    const romCapacity = req.body.romCapacity;
    const combPrice = req.body.combPrice;
    const quantity = req.body.quantity;
    const RAMROM = [];
    for(let i = 0; i < ramCapacity.length; i++){
        RAMROM.push({
           ramCapacity:ramCapacity[i],
           romCapacity : romCapacity[i],
           price:combPrice[i],
           quantity :quantity[i],
          });
    }
    req.body.RAMROM = RAMROM;
    req.body.category = new mongoose.Types.ObjectId(req.body.category);
    req.body.brand = new mongoose.Types.ObjectId(req.body.brand);
    await productCLTN.findByIdAndUpdate(req.query.id, req.body);
    
    res.redirect('/admin/product_management');
}
    catch(error){
        console.log("Product Editing POST error : " + error);
    }
}

// listig produsts


   
exports.changeListing = async(req, res) => {
    try {
          const productId = req.query.id;
          const currentProduct = await productCLTN.findById(productId);
          let currentListing = currentProduct.listed
          if(currentListing == true){
                currentListing = false
          }else{
                currentListing = true;
          }
          currentListing = Boolean(currentListing);
          await productCLTN.findByIdAndUpdate(productId, {listed : currentListing});
          console.log('yes');
          res.redirect('/admin/product_management');
    } catch (error) {
          console.log('Error in Product unlisting '+ error);
    }
}

