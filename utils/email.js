const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1. Create a transporter, i.e., the mailing service that actually sends mail
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    // connectionTimeout: 1 * 60 * 1000,
  });
  // 2. define mail options
  const mailOptions = {
    from: 'Govind-Asawa<govindasawa23@gmail.com>',
    to: options.to,
    subject: options.subject,
    text: options.message,
  };
  // 3. send Email
  await transport.sendMail(mailOptions);
};

module.exports = sendEmail;
