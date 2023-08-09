const categoryCLTN = require('../../model/admin/categorySchema');
const userCollection = require('../../model/userschema');
const productCLTN = require('../../model/admin/productSchema');
const cartCollection = require('../../model/cartShema');
const brandCLTN = require('../../model/admin/brandSchema')

// sinle search from home page
exports.singleview =  async(req,res)=>{
  try{
    const search = req.query.search
    
    let  searchResult1 = []
     if(search){
        
     searchResult1 = await productCLTN.find({
        name: {
            $regex: search,
            $options: 'i',
        },
        listed: true,
    }).populate('brand category');
     };
     console.log(searchResult1);
     const brandId = searchResult1[0].brand._id;
     let similarProducts = await productCLTN.find({'brand':brandId}).populate(['category','brand']);
     similarProducts = similarProducts.filter((product)=>product.name != searchResult1.name);

     res.render('userview/singlesearch',{
        searchResult1,
        similarProducts
     })
  }
  catch(err){
    console.log("error", err);
  }  
};


//Product collection page
exports.collection = async (req, res) => {
    
     try {
        let cartCount = 0

        let userCart = await cartCollection.findOne({ customer: req.session?.userData?._id });
        
        if (userCart) {
            for (let i = 0; i < userCart.products.length; i++) {
                cartCount += userCart.products[i].quantity
            }

        }

      
        let collectionId = req.query.query;
        let listing = req.session.listing;
        let listingName ;
        
        let currentUser = null;
        if (req.session.userData) {
            currentUser = await userCollection.findOne({ _id: req.session.userData._id })
        }
        if(!req.session.listingName){
            listingName= "All Products"
        }else{
            listingName = req.session.listingName
        };

        // view more
        if(collectionId == 'viewMore' && !req.session.sorted && !req.session.filter && !req.session.searched){
            listing = await productCLTN.find({listed:true}).populate('brand category');
            req.session.listing = listing;
            listingName = "All Products"
        }else if(!collectionId && !req.session.sorted && !req.session.filter && !req.session.searched ){
            listing = await productCLTN.find({listed:true}).populate('brand category').limit(9);
            req.session.listing = listing;
            listingName = "All Products"
        }else if(req.session.searched){
            listing = req.session.searchResult;
        }

        req.session.sorted = null;
        req.session.filter = null;
        req.session.searched= null;
         
        const brands = await brandCLTN.find({ isDeleted: false });
        const categories = await categoryCLTN.find({ isDeleted: false });
   
        // if (!listing || (listing.length == 0)) {
        //     listing = await productCLTN.find({ listed: true })
        //     .populate('brand category');
            
            res.render('userview/userProductListing', {
                userData: req.session.userData,
                session: req.session.userId,
                documentTitle: 'MyPhone',
                cartCount,
                currentUser,
                listing,
                listingName,
                brands,
                categories,
            });
        }

    catch (err) {
        console.log('product collectons not found' + err);
    }
}

//filter product list
exports.currentFilter = async (req, res) => {
    try {

        // let listing = req.session.listing
        let currentFilter;
        let allProducts = await productCLTN.find({ listed: true }).populate('brand category');
        
        let listingName = req.body.listingName;
        let searchClear;
       
        if (req.body.Id) {
            currentFilter = await productCLTN.find({
                listed: true,
                $or: [
                  { brand: req.body.Id },
                  { category: req.body.Id }
                ]
              }).populate('brand category');

         }else {
                currentFilter = allProducts
             }

            
         req.session.listing = currentFilter;
        
        req.session.filtered = currentFilter;
       
        req.session.filter = true;
        req.session.categorySort = null;
        req.session.sortBy = false;
        
        if(!currentFilter && !searchClear){
            res.json({
                  success : 0
            })
      }else if(searchClear){
            res.json({
                  success :'clear',
            });
      }else{
          res.json({
                success : 1,
          });
      }


    }
    catch (err) {
        console.log('Error in filter page' + err);
    }
}




exports.sortBy = async (req, res) => {
    try {
          if(!req.session.listing){
                req.session.listing = await productCLTN.find({listed : true}).populate('brand');
          }
          let listing = req.session.listing;
          
          if (req.body.sortBy === 'ascending') {
            listing = listing.sort((a, b) => a.RAMROM[0].price - b.RAMROM[0].price);
            req.session.listing = listing;
            console.log(listing[0].RAMROM[0].price);
            req.session.sorted = 1;
            res.json({
              message: 'sorted',
            });
          }
          else if(req.body.sortBy === 'descending'){
                listing = listing.sort((a, b) => b.RAMROM[0].price - a.RAMROM[0].price);
                req.session.listing = listing;
                console.log(listing[0].RAMROM[0].price);
                req.session.sorted = 1;
                res.json({
                      message : 'sorted',
                });
          } else if(req.body.sortBy === 'newReleases'){
                listing = listing.sort((a, b) => {
                      const idA = a._id.toString();
                      const idB = b._id.toString();
                      if(idA < idB){
                            return 1;
                      } else if(idA > idB){
                            return -1;
                      } 
                      return 0;
                });
                req.session.sorted = 1;
                req.session.listing = listing;
                res.json({
                      message : 'sorted',
                });
          }   
                req.session.categorySort=null;
                req.session.filtered=null;
                req.session.sortBy = listing
    } catch (error) {
          console.log('Error occured in Sorting : ' + error);
          
    }
  }

//product searching

exports.search = async (req, res) => {
    
    let searchResult = [];

   
        searchResult = await productCLTN.find({
            name: {
                $regex: req.body.searchInput,
                $options: 'i',
            },
            listed: true,
        });
   
     req.session.listing = searchResult;
    req.session.searchResult = searchResult;
    req.session.searched = true;
    res.json({
        message: 'Searched',
    });
}

