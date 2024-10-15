import nodemailer from 'nodemailer';

const sendEmail = async (
  email: string,
  subject: string,
  htmlContent: string
) => {
  // Créer un transporteur
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Définir les options de mail avec le contenu HTML passé en paramètre
  const mailOptions = {
    from: "Omari Kayumba <omarii@kayumba.io>",
    to: email,
    subject: subject,
    html: htmlContent,
  };

  // Envoyer le mail
  try {
    await transporter.sendMail(mailOptions);
  } catch (error: any) {
    // console.error('Erreur lors de l\'envoi de l\'email:', error.message);
  }
};

export default sendEmail;
