const request = require('supertest');
const mongoose = require('mongoose');
const { createServer } = require('../app');
const fs = require('fs');
const path = require('path');

let app, server;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  app = createServer();
  server = app.listen(0); // Use random available port
});

afterAll(async () => {
  await mongoose.disconnect();
  if (server) server.close();
});

describe('Booking Routes', () => {
  test('Booking page returns 400 without destination', async () => {
    const res = await request(app).get('/booking');
    expect(res.statusCode).toBe(400);
    expect(res.text).toContain('Destination is required');
  });

  test('Booking page renders form with destination', async () => {
    const res = await request(app).get('/booking?destination=Yaounde');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('Book Your Ticket to Yaounde');
    expect(res.text).toContain('name="destination" value="Yaounde"');
  });

  test('Rejects booking with missing fields', async () => {
    const res = await request(app).post('/book').send({
      name: 'Test User'
    });
    expect(res.statusCode).toBe(400);
    expect(res.text).toContain('All fields are required');
  });

  test('Rejects booking if age is not a number', async () => {
    const res = await request(app).post('/book').send({
      destination: 'Douala',
      name: 'Test User',
      age: 'abc',
      contact: '691234567',
      email: 'valid@gmail.com',
      date: '2025-04-15',
      time: '06:00 AM',
      busSerial: 'DOU-001'
    });
    expect(res.statusCode).toBe(400);
    expect(res.text).toContain('Age must be a number');
  });

  test('Rejects booking if email is missing', async () => {
    const res = await request(app).post('/book').send({
      destination: 'Buea',
      name: 'No Email User',
      age: 30,
      contact: '6901234567',
      date: '2025-04-21',
      time: '12:00 PM',
      busSerial: 'BUE-001'
    });
    expect(res.statusCode).toBe(400);
    expect(res.text).toContain('All fields are required');
  });

  test('Rejects booking if email is not Gmail', async () => {
    const res = await request(app).post('/book').send({
      destination: 'Limbe',
      name: 'Wrong Email',
      age: 32,
      contact: '6901234567',
      email: 'wrong@outlook.com',
      date: '2025-04-21',
      time: '03:00 PM',
      busSerial: 'LIM-002'
    });
    expect(res.statusCode).toBe(400);
    expect(res.text).toContain('Only Gmail addresses are accepted');
  });

  test('Creates a booking and saves PDF', async () => {
    const res = await request(app).post('/book').send({
      destination: 'Bamenda',
      name: 'PDF Booker',
      age: 29,
      contact: '6911122334',
      email: `pdfbooker${Date.now()}@gmail.com`, // ensure uniqueness
      date: '2025-04-22',
      time: '06:00 AM',
      busSerial: 'BAM-001'
    });

    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('Booking Successful');
    expect(res.text).toContain('PDF Booker');

    // Extract receipt number from response HTML
    const match = res.text.match(/Receipt Number:<\/strong>\s*(REC-\d{6})/);
    expect(match).not.toBeNull();
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    

    const receiptNumber = match[1];
    const receiptPath = path.join(__dirname, '..', 'public', 'receipts', `${receiptNumber}.pdf`);

    // Give time for file to be written
    await new Promise(resolve => setTimeout(resolve, 500));

    const fileExists = fs.existsSync(receiptPath);
    expect(fileExists).toBe(true);
  });
});
