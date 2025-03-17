import request from 'supertest';
import app from './api.js';

describe('POST /generate', () => {
  it('should generate combinations and store them in the database', async () => {
    const response = await request(app)
      .post('/generate')
      .send({ items: [1, 2, 3], length: 2 });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('combination');
  });

  it('should return 400 for invalid input', async () => {
    const response = await request(app)
      .post('/generate')
      .send({ items: [], length: 2 });
    expect(response.status).toBe(400);
  });
});
