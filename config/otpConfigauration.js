const nodemailer =  require('nodemailer')

function otp(){
    let otpgen= Math.floor(1000 + Math.random() * 9000)
    return otpgen
}

function mailObject(email,otpgen){
    let mailOptions= {
        from: 'myphonecart001@gmail.com',
        to: email,  //doseje1135@bitvoo.com
        subject: 'YOUR OTP',
        //   text: `enterotp`
        html: `<p>${otpgen}</p>`
    }
    return mailOptions
}
    
function mailService(mailOptions){
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'myphonecart001@gmail.com',
            pass: 'kahkbwkitbhyrcrz'  // password from gmail
        }
    });
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    })
}
module.exports={
    otp,
    mailObject,
    mailService
}