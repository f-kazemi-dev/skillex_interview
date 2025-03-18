import request from 'supertest';
import app from './api';

let server;

beforeAll((done) => {
  server = app.listen(4000, () => {
    global.agent = request.agent(server);
    done();
  });
});

afterAll((done) => {
  if (server) {
    server.close(done);
  } else {
    done();
  }
});

describe('POST /generate', () => {
  it('should return a valid combination', async () => {
    const response = await global.agent
      .post('/generate')
      .send({ items: [1, 2, 1], length: 2 });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('combination');
    expect(response.body.combination.length).toBe(5);
  });

  it('should return 400 for invalid input', async () => {
    const response = await global.agent
      .post('/generate')
      .send({ items: [], length: 2 });
    expect(response.status).toBe(400);
  });
});
