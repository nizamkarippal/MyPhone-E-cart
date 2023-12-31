const bannerCLTN  = require('../../model/admin/banarSchema')
const sharp = require('sharp')


exports.bannerPage = async (req, res)=> {
    try{
          const allBanners = await bannerCLTN.find({}).sort({_id : -1});
          res.render('adminview/partials/Banar', {
                session : req.session.admin,
                documentTitle : 'Banner Management | MyPhone',
                allBanners : allBanners,
          });
    }
    catch(error){
          console.log('Error in GET Banner ' + error);
    }
};

 // adding new banner
exports.addBanner = async (req, res) => {
    const allBanners = await bannerCLTN.find({}).sort({_id : -1});
    try{  
          if(req.file){
                // image processing using sharp
                let bannerImage = `${req.body.title}_${Date.now()}.png`;
                sharp(req.file.buffer)
                      .toFormat('png')
                      .png({quality:80})
                      .toFile(`public/img/banners/${bannerImage}`);
                
                req.body.image= bannerImage;
          }
          // saving to DB collection
          
          const newBanner = new bannerCLTN(req.body);
          await newBanner.save();
          res.redirect('/admin/banner_management');
    }
    catch(error){
          console.log('Error in Add new Banner '+ error);
          res.render('adminview/partials/Banar',{
                session : req.body.session,
                errorMessage: 'Unable to add new Banner',
                documentTitle : 'Banner Management | LAP4YOU',
                allBanners : allBanners
          });
    }
};
// making banner inactive
exports.changeActivity = async (req, res) => {
    try {
          // changin true to false and vice versa
          let newActivity = req.body.currentActivity;
          newActivity = JSON.parse(newActivity);
          newActivity = !newActivity;
          await bannerCLTN.findByIdAndUpdate(req.body.bannerID, {$set:{active:newActivity}},);
          // reload will occur in ajax
          res.json({
                data:{
                activity :1,
               },
          });
    } catch (error) {
          console.log('Error in Changing Activity of Banner'+ error);
    }
};


//deleting banner
exports.deleteBanner = async (req, res) => {
    try{
          const bannerID = req.body.bannerID;
          await bannerCLTN.findByIdAndDelete(bannerID);
          res.json({
                data : {deleted :1},
          },);
    } catch(error){
          console.log('Error in Deleting Banner '+ error);
    }
};