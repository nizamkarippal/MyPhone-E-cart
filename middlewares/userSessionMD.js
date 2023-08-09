
function userSession(req,res,next){
    if(req.session.userData){
        next()
    }
    else{

        res.redirect('/login')
    }
}

function withOutUserSession(req,res,next){
    if(!req.session.userData){
        next()
    }
    else{
        res.redirect('/')
    }
}

function userSessionForAjax(req,res,next){
    if(req.session.userData){
        next()
    }
    else{
        res.json({notLoggedIn:true})
    }
}


// object Id Checking
const ObjectId = require('mongoose').Types.ObjectId;
const objectIdCheck = (req, res, next) => {
      if (ObjectId.isValid(req.params.id)){
            if(String(new ObjectId(req.params.id)) === req.params.id){
                  next();
            } else{
                  res.redirect('/');
            }
      }else{
        res.render('404Error')
      }
}



module.exports={ 
    userSession,
    userSessionForAjax,
    withOutUserSession,
    objectIdCheck
}