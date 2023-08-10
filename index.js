
require('dotenv').config()
const express = require('express');
const app= express();
const createError =  require('http-errors')
const userRouter = require('./routes/userRoutes')

const ejs = require('ejs')

/*---------------------------Setups-----------------------------*/
app.use(express.urlencoded({extended:true}))//to get data from post method
const sessions=require('express-session')
app.use(sessions({//setup session
  
  name:'MyPhoneSession',
    resave:true,
    saveUninitialized:true,
    secret:'khfihuifgyscghi6543367567vhbjjfgt45475nvjhgjgj+6+9878', //random hash key string to genarate session id    
    cookie:  { secure: false }
    }))


app.use((req, res, next) => {//setup cache
    res.set("Cache-Control", "no-store");
    next();
});
const path=require('path')
const expressLayouts=require('express-ejs-layouts')
app.use('/public',express.static(path.join(__dirname,'public')))//static file setup for salesrepor download only?????????
app.use(express.static('./public'));//static file setup for folders in public folder,jithin is a folder inside the public folder
app.use(expressLayouts)//setting up layout
app.set('view engine','ejs')//setting up  view engine
// app.set('view','./view')//setting up directory for view engine, here views is the folder


//setting up directory for view engine, here views is the folder

const mongodb=require('./config/mongooseconnection')
mongodb()//involked the imported function from mongooseConnection.

app.use('/',userRouter) //enable the user router

//enable the admin router
const adminRouter = require('./routes/adminRouter')
app.use('/admin', adminRouter) 

//enable the product _ listing
const productListing = require('./routes/user-productRouter');
app.use('/',productListing)


app.use('*',(req,res,next)=>{
  next(createError(404))
})

app.use((err,req,res,next)=>{//error handling middle-ware

  res.status(404).render('404Error')
})



  
  app.listen(process.env.PORT,()=>console.log('Server started'))
  



  
  
  







  


  
