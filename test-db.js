// test-db.js
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/musango-express')
  .then(() => {
    console.log('✅ MongoDB connected!');
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err);
  });
