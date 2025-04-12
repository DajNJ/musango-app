const request = require('supertest');
const mongoose = require('mongoose');
const { createServer } = require('../app');

let app, server;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  app = createServer();
  server = app.listen(0); // Use random port
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
      date: '2025-04-15',
      time: '06:00 AM',
      busSerial: 'DOU-001'
    });
    expect(res.statusCode).toBe(400);
    expect(res.text).toContain('Age must be a number');
  });

  test('Creates a booking with valid data', async () => {
    const res = await request(app).post('/book').send({
      destination: 'Douala',
      name: 'Valid Booker',
      age: 28,
      contact: '6901234567', // ✅ Valid length
      date: '2025-04-20',
      time: '09:00 AM',
      busSerial: 'DOU-001'
    });

    // console.log('Booking POST response text:', res.text); // Uncomment for debug

    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('Booking Successful');
    expect(res.text).toContain('Valid Booker');
    expect(res.text).toContain('DOU-001');
  });
});
