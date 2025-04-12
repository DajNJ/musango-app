const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('index', { title: 'Home' });
});

router.get('/about', (req, res) => {
  res.render('about', { title: 'About Us' });
});

router.get('/services', (req, res) => {
  res.render('services', { title: 'Our Services' });
});

router.get('/contacts', (req, res) => {
  res.render('contacts', { title: 'Contact Us' });
});

router.get('/destinations', (req, res) => {
  const regions = ['Littoral', 'Centre', 'East', 'Northwest', 'West', 'South', 'Adamawa', 'FarNorth', 'North', 'Southwest']; // You can update this list
  res.render('destinations', {
    title: 'Our Destinations',
    regions
  });
});


// Optional health check for testing
router.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

module.exports = router;
