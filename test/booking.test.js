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
  server = app.listen(0);
});

afterAll(async () => {
  await mongoose.disconnect();
  if (server) server.close();

  // Optional: Clean up test-generated receipts
  const receiptsDir = path.join(__dirname, '..', 'public', 'receipts');
  fs.readdirSync(receiptsDir)
    .filter(file => file.startsWith('REC-'))
    .forEach(file => fs.unlinkSync(path.join(receiptsDir, file)));
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
    const email = `pdfbooker${Date.now()}@gmail.com`;
    const res = await request(app).post('/book').send({
      destination: 'Bamenda',
      name: 'PDF Booker',
      age: 29,
      contact: '6911122334',
      email,
      date: '2025-04-22',
      time: '06:00 AM',
      busSerial: 'BAM-001'
    });

    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('Booking Successful');
    expect(res.text).toContain('PDF Booker');

    // Extract receipt number from HTML using a more tolerant regex
    const match = res.text.match(/Receipt Number:<\/strong>\s*(REC-\d{6})/i);
    expect(match && match[1]).toBeDefined();

    const receiptNumber = match[1];
    const receiptPath = path.join(__dirname, '..', 'public', 'receipts', `${receiptNumber}.pdf`);

    // Wait up to 2 seconds for PDF to be saved
    let found = false;
    for (let i = 0; i < 10; i++) {
      if (fs.existsSync(receiptPath)) {
        found = true;
        break;
      }
      await new Promise(res => setTimeout(res, 200));
    }

    expect(found).toBe(true);
  });
});
