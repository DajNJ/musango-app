const request = require('supertest');
const mongoose = require('mongoose');
const { createServer } = require('../app');

let app, server;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  app = createServer();
  server = app.listen(0);
});

afterAll(async () => {
  await mongoose.disconnect();
  await server.close();
});

describe('Musango Express App', () => {
  it('should return 200 for /health', async () => {
    const response = await request(app).get('/health');
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('OK');
  });

  it('should render home page', async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(200);
    expect(response.text).toContain('Welcome to Musango Express');
  });

  it('should render services page', async () => {
    const response = await request(app).get('/services');
    expect(response.statusCode).toBe(200);
    expect(response.text).toContain('Transportation');
  });

  it('should render about page', async () => {
    const response = await request(app).get('/about');
    expect(response.statusCode).toBe(200);
    expect(response.text).toContain('About Us');
  });
});
