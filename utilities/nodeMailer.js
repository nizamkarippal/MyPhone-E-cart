const nodemailer = require('nodemailer');


function sendMail(email, subject, status, person, id){
console.log(person);
      // mail options
      let mailOptions = {
            from:'myphonecart001@gmail.com',
            to: email,
            subject : `Order has been ${status} successfully!`,
            html: `<h1> order has been ${status} successfully</h1>
                  </br><h4 style="text-color: red, font-weight: bold"><p>${subject}</p></h4>
                  </br><p><a href = https://www.MyPhone.shop/${person}/orders/${id}>Click here </a> to view the order Details </p>`,
      };

        // creating transporter
        let transporter = nodemailer.createTransport({
            service:'gmail',
            auth: {
                user: 'myphonecart001@gmail.com',
                pass: 'kahkbwkitbhyrcrz'  // password from gmail
            },
      });

      transporter.sendMail(mailOptions, (error, info)=> {
            if(error){
                  console.log('error Occured : '+error);
            } else{
                  console.log(`Email Sent SuccessFully`);
            }
            return;
      });
}

module.exports = sendMail;