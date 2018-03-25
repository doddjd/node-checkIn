const nodemailer = require('nodemailer');
const account = require('./ticketInfo').emailToken;

let sendMail = (actInfo) => {
    
    let transporter = nodemailer.createTransport({
        host: 'smtp.163.com',
        port: 465,
        secure: true, // use TLS
        auth: {
            user: account.user, // generated ethereal user
            pass: account.pass // generated ethereal password
        }
    });

    // setup email data with unicode symbols
    let mailOptions = {
        from: '"jd" <hajiang2010@163.com>', // sender address
        to: 'hajiang2012@163.com', // list of receivers
        subject: `${actInfo.emailTpl.title} + ${actInfo.emailTpl.date} -subject` , // Subject line
        text: `${actInfo.emailTpl.title} + ${actInfo.emailTpl.date} - text`, // plain text body
        html: actInfo.emailTpl.innerHtml // html body
    };
    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    });
};


module.exports = sendMail;