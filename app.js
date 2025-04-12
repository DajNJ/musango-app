// app.js
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const morgan = require('morgan');

dotenv.config();
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/musango-express';
const PORT = process.env.PORT || 8080;

function createServer() {
  const app = express();

  // Middleware
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(morgan('dev'));

  // View engine
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));

  // Routes
  app.use('/', require('./routes/index'));
  app.use('/', require('./routes/booking'));

  // Health check
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', env: process.env.NODE_ENV || 'dev' });
  });

  return app;
}

if (require.main === module) {
  mongoose.connect(MONGO_URI).then(() => {
    console.log('Connected to MongoDB');
    const app = createServer();
    app.listen(PORT, () => {
      console.log(`🚀 Musango App is running at http://localhost:${PORT}`);
    });
  }).catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
}

module.exports = { createServer };
