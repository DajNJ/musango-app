// utils/mailer.js
const nodemailer = require('nodemailer');

// Update this with your credentials or use environment variables
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER || 'your-email@gmail.com',
    pass: process.env.MAIL_PASS || 'your-app-password'
  }
});

async function sendEmailWithPDF(to, pdfBuffer, booking) {
  const mailOptions = {
    from: '"Hill-Top Consultancy" <your-email@gmail.com>',
    to,
    subject: `Booking Receipt - ${booking.receiptNumber}`,
    text: `Hello ${booking.name},\n\nThank you for booking with Hill-Top Consultancy. Your receipt is attached.\n\nDestination: ${booking.destination}\nDate: ${booking.date}\nTotal Paid: 12,400 XAF\n\nSafe travels!`,
    attachments: [
      {
        filename: `receipt-${booking.receiptNumber}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }
    ]
  };

  await transporter.sendMail(mailOptions);
}

module.exports = sendEmailWithPDF;
