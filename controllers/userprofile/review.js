const mongoose = require('mongoose');
const reviewCLTN = require('../../model/reviewSchema');

// /add new review for delivered product
exports.addNew = async(req,res)=>{
    try{
        req.body.customer = req.session.userData._id;
        await reviewCLTN.create(req.body);
        res.json({
            success : 1
        });
    }
    catch(err){
        console.log("Error in new addReviewController", err);
    }
}

// marking review helpful 
exports.helpful = async(req, res) => {
    try {
          if(req.session.userData._id !=undefined){
                await reviewCLTN.findByIdAndUpdate(req.body.id, {
                      $inc:{
                            helpful : 1
                      }
                });
                res.json({
                      message : 1
                });
          } else{
                res.json({
                      message : 0
                });
          }
    } catch (error) {
          console.log("Error in Helpful Review : " + error);
          
    }
}