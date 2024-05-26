const nodemailer = require("nodemailer");
const sendEmail = (options) => {
  // Créer un transporteur
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  // Definir les options de mail
  const mailOptions = {
    from: "Omari Kayumba <omarii@kayumba.io>",
    to: options.email,
    subject: options.subject,
    html: options.message,
  };
  // Envoyer le mail
  transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
