import request from 'supertest';
import app from './api.js';
import http from 'http';

let server;

beforeAll((done) => {
  console.log('Starting server...');
  server = http.createServer(app);
  server.listen(3001, () => {
    console.log('Server started');
    done();
  });
}, 30000);

afterAll((done) => {
  console.log('Stopping server...');
  server.close(() => {
    console.log('Server stopped');
    done();
  });
}, 30000);

describe('POST /generate', () => {
  it('should generate combinations and store them in the database', async () => {
    const response = await request(server)
      .post('/generate')
      .send({ items: [1, 2, 3], length: 2 });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('combination');
  }, 10000);

  it('should return 400 for invalid input', async () => {
    const response = await request(server)
      .post('/generate')
      .send({ items: [], length: 2 });
    expect(response.status).toBe(400);
  }, 10000);
});
