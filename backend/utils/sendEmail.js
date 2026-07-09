const nodemailer = require('nodemailer');
const dns = require('dns');

// Force Node.js to prefer IPv4 DNS resolution. 
// Fixes ENETUNREACH error on Render when trying to connect to Gmail SMTP over IPv6.
if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}

const sendEmail = async (options) => {
  try {
    // Create a transporter
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      connectionTimeout: 10000, // 10 seconds
      socketTimeout: 10000,     // 10 seconds
    });

    // Define the email options
    const mailOptions = {
      from: `House Of Induva <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html, // Optional HTML version
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${options.email}`);
  } catch (error) {
    console.error('Error sending email:', error.message);
    throw error;
  }
};

module.exports = sendEmail;
