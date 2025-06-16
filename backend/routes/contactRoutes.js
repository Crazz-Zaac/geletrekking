const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

router.post('/', async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Please provide name, email and message.' });
  }

  try {
    // Create reusable transporter object using SMTP transport
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // your email address from .env
        pass: process.env.EMAIL_PASS, // your email password or app password from .env
      },
    });

    // Setup email data
    const mailOptions = {
      from: `"${name}" <${email}>`, // sender info
      to: process.env.ADMIN_EMAIL, // admin email from .env
      subject: subject || `New contact message from ${name}`,
      text: `You have a new message from your contact form:

Name: ${name}
Email: ${email}
Subject: ${subject || 'No subject'}

Message:
${message}
      `,
      html: `
        <p>You have a new message from your contact form:</p>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject || 'No subject'}</p>
        <p><strong>Message:</strong><br/>${message}</p>
      `,
    };

    // Send mail with defined transport object
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Message sent successfully!' });
  } catch (err) {
    console.error('Error sending email:', err);
    res.status(500).json({ error: 'Failed to send message. Please try again later.' });
  }
});

module.exports = router;
