const express = require('express');
const router = express.Router();
const Booking = require('../models/booking');
const { generateReceiptPDF } = require('../utils/pdfGenerator');
const sendEmailWithPDF = require('../utils/mailer');
const fs = require('fs');
const path = require('path');

// Render booking form
router.get('/booking', (req, res) => {
  const { destination } = req.query;
  if (!destination) {
    return res.status(400).send('Destination is required.');
  }

  res.render('booking-form', {
    destination,
    error: null,
    formData: {}
  });
});

// Handle booking form submission
router.post('/book', async (req, res) => {
  console.log('📥 Form submission body:', req.body);

  const { destination, name, age, contact, email, date, time, busSerial } = req.body;

  const formData = { name, age, contact, email, date, time, busSerial };
  const safeDestination = destination || '';

  // Basic validation
  if (!destination || !name || !age || !contact || !email || !date || !time || !busSerial) {
    return res.status(400).render('booking-form', {
      destination: safeDestination,
      error: 'All fields are required.',
      formData
    });
  }

  if (!email.endsWith('@gmail.com')) {
    return res.status(400).render('booking-form', {
      destination: safeDestination,
      error: 'Only Gmail addresses are accepted.',
      formData
    });
  }

  if (isNaN(age)) {
    return res.status(400).render('booking-form', {
      destination: safeDestination,
      error: 'Age must be a number.',
      formData
    });
  }

  if (contact.length < 10 || contact.length > 15) {
    return res.status(400).render('booking-form', {
      destination: safeDestination,
      error: 'Contact number must be between 10 and 15 characters.',
      formData
    });
  }

  const receiptNumber = `REC-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;

  try {
    const booking = new Booking({
      destination: safeDestination,
      name,
      age,
      contact,
      email,
      date,
      time,
      busSerial,
      receiptNumber
    });

    await booking.save();

    // Generate receipt PDF
    const pdfBuffer = await generateReceiptPDF(booking);

    // Save locally for download
    const receiptsDir = path.join(__dirname, '..', 'public', 'receipts');
    if (!fs.existsSync(receiptsDir)) {
      fs.mkdirSync(receiptsDir, { recursive: true });
    }

    const pdfPath = path.join(receiptsDir, `${receiptNumber}.pdf`);
    fs.writeFileSync(pdfPath, pdfBuffer);

    // Send email to client only (skip in test environment)
    if (process.env.NODE_ENV !== 'test') {
      console.log(`📤 Sending receipt to user: ${email}`);
      await sendEmailWithPDF(email, pdfBuffer, booking);
    }

    // Show success page with download option
    res.render('booking-success', { booking });

  } catch (err) {
    console.error('Booking error:', err);

    if (err.code === 11000) {
      return res.status(400).render('booking-form', {
        destination: safeDestination,
        error: 'Duplicate booking detected. Please try again.',
        formData
      });
    }

    res.status(500).render('error', { message: 'Internal Server Error' });
  }
});

module.exports = router;
