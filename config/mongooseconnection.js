const mongoose =require('mongoose')
const dotenv = require("dotenv")
dotenv.config()//will convert the .env file into an object
/********************Connection setUp of mongoose Driver**************************/ 

function mongodb(){
    mongoose.set('strictQuery', true)//to supress the warning from console while connecting ,we can delete this line of code
    mongoose.connect(process.env.MONGO_URL,{
        useNewUrlParser: true,
      })
    .then(()=>{
        console.log("connected to mongo db");
    }).catch(()=>{
        console.log("error in connecting to mongo db");
    })
}
module.exports=mongodb









