const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

class Email {
  constructor(user, url) {
    (this.to = user.email),
      (this.url = url),
      (this.firstName = user.name.split(' ')[0]),
      (this.lastName = user.name.split(' ')[1]),
      (this.from = `Govind-Asawa<${process.env.EMAIL_FROM}>`);
  }

  newTransporter() {
    if (process.env.NODE_ENV === 'production') {
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
      // connectionTimeout: 1 * 60 * 1000,
    });
  }

  async send(template, subject) {
    // 1. generate HTML out of the pug template, by placing all the necessary values
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      subject,
      name: this.firstName,
      url: this.url,
    });

    // 2. mail options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.htmlToText(html),
    };

    // 3. create a new Transporter and send email with the options
    await this.newTransporter().sendMail(mailOptions);
  }

  async sendWlcmMail() {
    await this.send('welcome', 'Welcome to the Natours Family');
  }

  async sendPassResetMail() {
    await this.send('passReset', 'Password Reset Link, Valid for 10 mins');
  }
}

module.exports = Email;
