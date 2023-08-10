const adminCLTN = require('../../model/admin/adminSchema');
const sessionCheck = require('../../middlewares/adminSessionMW');

// admin page rendering
exports.page = async (req, res)=> {
      
      try{
            // console.log("fdhghf")
            res.render('adminview/partials/adminLoginPage', {
                  documentTitle : 'Admin SignIn Page | MyPhone',
            })
      } catch(err){
            console.log('Error occured while rendering the Admin sign in page' + err);
      }
};


// admin verification 
exports.adminVerification = async(req, res)=> {
      try{
             const inputPassword = req.body.password;
             const inputEmail = req.body.email.toLowerCase();
             const adminFind = await adminCLTN.findOne({email : inputEmail});
             
             if(adminFind){
                  if(adminFind.password === inputPassword){
                        req.session.admin = req.body.email;
                        console.log('Admin session created successfully');
                        res.redirect('/admin/dashboard');
                  }
                  else{
                        res.render('adminview/partials/adminLoginPage',{
                              documentTitle : 'Admin SignIn Page | MyPhone',
                              errorMessage:'Incorrect Password',
                              }
                        );
                  }
            }
            else{
                  res.render('adminview/partials/adminLoginPage', {errorMessage:'Admin not Found !'});
            }
      }
      catch(error){
            console.log('Failed to login'+ error);
      }

}