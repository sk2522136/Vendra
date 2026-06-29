import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  //  Transporter 
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  //  Email  content 
  const mailOptions = {
    from: `"VENDRA" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.html, 
  };

  // 3. Email send
  await transporter.sendMail(mailOptions);
};

export default sendEmail;