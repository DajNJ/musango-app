// routes/booking.js

const express = require('express');
const router = express.Router();
const Booking = require('../models/booking');

// Render booking form
router.get('/booking', (req, res) => {
  const { destination } = req.query;
  if (!destination) {
    return res.status(400).send('Destination is required.');
  }

  res.render('booking-form', {
    destination: destination || '',
    error: null,
    formData: {}
  });
});

// Handle booking form submission
router.post('/book', async (req, res) => {
  console.log('📥 Form submission body:', req.body); // Debug line

  const { destination, name, age, contact, date, time, busSerial } = req.body;

  const formData = {
    name: name || '',
    age: age || '',
    contact: contact || '',
    date: date || '',
    time: time || '',
    busSerial: busSerial || ''
  };

  const safeDestination = destination || '';

  // Input validation
  if (!destination || !name || !age || !contact || !date || !time || !busSerial) {
    return res.status(400).render('booking-form', {
      destination: safeDestination,
      error: 'All fields are required.',
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
      date,
      time,
      busSerial,
      receiptNumber
    });

    await booking.save();
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
