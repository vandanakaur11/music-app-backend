const nodemailer = require("nodemailer");

function sendMail({ from, to, subject, text }) {
  let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.MAIL_USER_ETHER,
      pass: process.env.MAIL_PASS_ETHER,
    },
  });

  let mailOptions = {
    from,
    to,
    subject,
    text,
  };

  transporter.sendMail(mailOptions, (err, data) => {
    if (err) return console.log("Error occurs", err);
    console.log(data);
  });
}

module.exports = sendMail;
