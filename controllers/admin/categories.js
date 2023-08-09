const categoryCLTN = require('../../model/admin/categorySchema');


//view categories
exports.view =async (req,res)=>{
try{
const categoryDetails = await categoryCLTN.find({isDeleted:false})
res.render('adminview/partials/categories',{
    session :req.session.admin,
    documentTitle : 'Category Management | MyPhone',
     details : categoryDetails

});


}
catch(error){
    res.render('admin/partials/dashboard',{
          documentTitle : 'Dash Board | MyPhone',
          session : req.session.admin,
          errorMessage : error
    });
}
}

//add new category form  view and submit logic
exports.addCategory = async(req,res)=>{
    try {
        let inputCategoryName = req.body.category
        inputCategoryName = inputCategoryName.toUpperCase();//to conver uppercase for comaprison of duplication
        let categoryDetails = await categoryCLTN.find({isDeleted:false})
        const duplicateCheck = await categoryCLTN.findOne({name:inputCategoryName})
        if(duplicateCheck){
            // checking if category name deleted, if yes retrieve the soft deleted category
            if(duplicateCheck.isDeleted == true){
                await categoryCLTN.updateOne(
                { _id:duplicateCheck._id},
                {isDeleted:false});

                categoryDetails = await categoryCLTN.find({isDeleted:false}) ;
            res.render('adminview/partials/categories',{
               
                documentTitle : 'Category Management | MyPhone',
                details : categoryDetails,
                session :req.session.admin
            })    

            }else{
                res.render('adminview/partials/categories',{
                    
                    documentTitle : 'Category Management | MyPhone',
                    details : categoryDetails ,
                    session :req.session.admin,
                    errorMessage:`category  ${inputCategoryName} exists`
                });

            }
        }else{
            //add new category and svae
            const newCategory = new categoryCLTN({
                name : inputCategoryName,
          });
          await newCategory.save();
          res.redirect('/admin/categories');
        }
    }catch(err){
console.log('error adding newCategory'+err);
    }

}


//edit categorypage view
exports.editCategoryPage = async(req,res)=>{
    const categoryId = req.query.id
    try{
        const currentCategory = await categoryCLTN.findById(categoryId)
        req.session.currentCategory = currentCategory
        res.render('adminview/partials/categoriesEdit',{
            session : req.session.admin,
            documentTitle : 'Category Management | MyPhone',
            category : currentCategory
        })

    }
    catch(err){
        console.log(`error in edit ${err}`);

    }
}

//edit category 
exports.editCategory = async(req,res)=>{
    try{
        const currentCategory = req.session.currentCategory
        let updatename = req.body.name
        updatename = updatename.toUpperCase()
        //duplicate check
     const duplicateCheck  = await categoryCLTN.findOne({name:updatename})
     if(duplicateCheck == null){
        await categoryCLTN.updateOne(
            { _id: currentCategory._id},{name:updatename}
        )
        res.redirect('/admin/categories');

    }else{
        res.render('adminview/partials/categoriesEdit',{
            session : req.session.admin,
            documentTitle : 'Category Management | MyPhone',
            category : currentCategory,
            errorMessage:`${updatename} are exisist...`
        })
    }


    }
    catch(error){
        console.log('Error in Post Category ' + error);
  }
}

//delite category
exports.deleteCategory = async(req,res)=>{
    try{
        const categoryId = req.query.id
        await categoryCLTN.updateOne({_id:categoryId},{isDeleted:true})
        res.redirect('/admin/categories');

    }
    catch(err){
        console.log('error form in delete' + err);

    }
}
