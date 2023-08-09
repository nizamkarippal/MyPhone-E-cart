const brandCLTN  = require('../../model/admin/brandSchema')

exports.view = async (req,res)=>{
    try{
         const brandDetails = await brandCLTN.find({isDeleted:false})
         res.render('adminview/partials/brands',{
            session : req.session.admin,
            documentTitle : 'Brand Management | MyPhone',
            details : brandDetails,
         })
       }
    catch(error){
        res.render('admin/partials/admindashboard', {
            session : req.session.admin,
            documentTitle : 'Dash Board | MyPhone',
            errorMessage : error,
      });

    }
};

//add brands 
exports.addBrand = async(req,res)=>{
    try{
        let brandname = req.body.brand
        brandname = brandname.toUpperCase()
        let brandDetails = await brandCLTN.find({isDeleted:false})
        //duplication check
        const duplicationCheck = await brandCLTN.findOne({name:brandname})
        if(duplicationCheck){
            if(duplicationCheck.isDeleted == true){
                await brandCLTN.updateOne(
                    {_id:duplicationCheck._id},
                    {isDeleted:false}
                );
                brandDetails = await brandCLTN.find({isDeleted:false})
                res.render('adminview/partials/brands',{
                    documentTitle: 'Brand Management | MyPhone',
                               details : brandDetails,
                               session : req.session.admin
                });
            }else{
                res.render('adminview/partials/brands',{
                    documentTitle: 'Brand Management | MyPhone',
                    details : brandDetails,
                    session : req.session.admin,
                    errorMessage:`Brand ${brandname} is exisist`


            });
        }
    }else{
        const newBrand = new brandCLTN({
            name:brandname
        })
        await newBrand.save();
        res.redirect('/admin/brands')
    }
    }
    catch(err){
        console.log("Error in add Brand" + err)
    }

}

// get edit brand page
exports.editBrandPage = async(req,res)=>{
    try{
        const brandId = req.query.id;
        const currentBrand = await brandCLTN.findById(brandId)
        req.session.currentBrand = currentBrand
        res.render('adminview/partials/editBrand',{
            session : req.session.admin,
            documentTitle:'Brand Management | MyPhone',
            brand : currentBrand, 
        })

    }
    catch(error){
        console.log('Error in GET category Page ' + error);

    }
}

// post edit brand page
exports.editBrand = async(req,res)=>{
    try{ 
        const currentBrand = req.session.currentBrand;
        let editedBrandName=  req.body.name;
        editedBrandName = editedBrandName.toUpperCase()
        //duplication check
        const duplicationCheck = await brandCLTN.findOne({name:editedBrandName});
        if(!duplicationCheck){
            await brandCLTN.updateOne(
                {_id:currentBrand._id},
                {name:editedBrandName}
            );
            res.redirect('/admin/brands');
        }
        else{
            res.render('adminview/partials/editBrand',{
                session : req.session.admin,
                documentTitle:'Brand Management | MyPhone',
                brand : currentBrand,
                errorMessage:`${editedBrandName} exisist`
            })
        }
    }
    catch (error) {
        console.log('Error in POST brand ' + error);
  }
}

//delete brands
exports.deleteBrand = async(req,res)=>{
    try{
        const brandId = req.query.id
        await brandCLTN.updateOne(
            {_id:brandId},
            {isDeleted:true}
        )
        res.redirect('/admin/brands');
    }
    catch(error){
        console.log('brand delete' + error);

    }
}


