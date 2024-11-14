const nodemailer = require('nodemailer');
const config = require('../config/config');
const createEmailHTMLTemplate = require('../templates/createEmailHTMLTemplate');
const transporter = nodemailer.createTransport(config.emailConfig);

exports.sendScheduleEmail = async ( scheduleType,notifications,targetLang) => {
  try {
    const emailContent = await createEmailHTMLTemplate(scheduleType, notifications,targetLang);

    const mailOptions = {
      from: config.emailFrom,
      to: notifications.userEmail,  // Changed from notification.email to notification.userEmail
      subject: `${scheduleType} Schedule Update`,  // Updated subject line
      html: emailContent
    };

    await transporter.sendMail(mailOptions);
    console.log('Schedule email sent successfully');
  } catch (error) {
    console.error('Error sending schedule email:', error);
    throw error;
  }
}

exports.sendVerificationEmail = async (email, token) => {

  const mailOptions = {
    from: config.emailFrom,
    to: email,
    subject: 'Verify Your Email',
    html: `
      <p>Please click the link below to verify your email:</p>
      <a href="${config.frontendUrl}/verify-email/${token}">Verify Email</a>
    `
  };
  
  await transporter.sendMail(mailOptions);
};
exports.sendPasswordChangeEmail = async (email, tempPassword) => {

  const mailOptions = {
    from: config.emailFrom,
    to: email,
    subject: 'Action Required: Change Your Password',
    html: `
      <p>Welcome! You've successfully logged in with Google </p>
      For security reasons, please log in to your account and change your password as soon as possible. Your temporary password is ${tempPassword}
    `
  };
  
  await transporter.sendMail(mailOptions);
};

exports.send2FACode = async (email, code) => {
  const mailOptions = {
    from: config.emailFrom,
    to: email,
    subject: 'Your 2FA Code',
    text: `Your 2FA code is: ${code}`
  };
  
  await transporter.sendMail(mailOptions);
};
