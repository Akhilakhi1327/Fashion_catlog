const nodemailer = require('nodemailer');
const dns = require('dns');

// Force Node.js to prefer IPv4 DNS resolution.
// Fixes ENETUNREACH error on Render when trying to connect to Gmail SMTP over IPv6.
if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}

// Create transporter with explicit host/port config
const createTransporter = (port) => {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: port,
    secure: port === 465, // true for 465 (SSL), false for 587 (STARTTLS)
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    connectionTimeout: 10000,
    socketTimeout: 10000,
  });
};

const sendEmail = async (options) => {
  const mailOptions = {
    from: `House Of Induva <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  // Try port 587 (STARTTLS) first, fallback to port 465 (SSL)
  const ports = [587, 465];

  for (const port of ports) {
    try {
      const transporter = createTransporter(port);
      await transporter.sendMail(mailOptions);
      console.log(`Email sent successfully to ${options.email} via port ${port}`);
      return; // Success, exit
    } catch (error) {
      console.error(`Failed to send email via port ${port}: ${error.message}`);
      if (port === ports[ports.length - 1]) {
        // Last port also failed, throw the error
        throw error;
      }
      // Otherwise, try next port
      console.log(`Retrying with next port...`);
    }
  }
};

module.exports = sendEmail;
