const express = require('express');
const router = express.Router();
const Booking = require('../models/booking');

// Render booking form
router.get('/booking', (req, res) => {
  const { destination } = req.query;
  if (!destination) {
    return res.status(400).send('Destination is required.');
  }
  res.render('booking-form', { destination });
});

// Handle booking form submission
router.post('/book', async (req, res) => {
  const { destination, name, age, contact, date, time, busSerial } = req.body;

  // Input validation
  if (!destination || !name || !age || !contact || !date || !time || !busSerial) {
    return res.status(400).render('booking-form', {
      destination,
      error: 'All fields are required.',
      formData: { name, age, contact, date, time, busSerial },
    });
  }

  if (isNaN(age)) { // Fixed: Added missing parenthesis
    return res.status(400).render('booking-form', {
      destination,
      error: 'Age must be a number.',
      formData: { name, age, contact, date, time, busSerial },
    });
  }

  if (contact.length < 10 || contact.length > 15) {
    return res.status(400).render('booking-form', {
      destination,
      error: 'Contact number must be between 10 and 15 characters.',
      formData: { name, age, contact, date, time, busSerial },
    });
  }

  // Generate receipt number
  const receiptNumber = `REC-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;

  try {
    // Save booking to database
    const booking = new Booking({ destination, name, age, contact, date, time, busSerial, receiptNumber });
    await booking.save();

    // Render success page with booking details
    res.render('booking-success', { booking });
  } catch (err) {
    console.error('Booking error:', err);

    // Handle duplicate key errors (e.g., duplicate receipt number)
    if (err.code === 11000) {
      return res.status(400).render('booking-form', {
        destination,
        error: 'Duplicate booking detected. Please try again.',
        formData: { name, age, contact, date, time, busSerial },
      });
    }

    // Handle other errors
    res.status(500).render('error', { message: 'Internal Server Error' });
  }
});

module.exports = router;