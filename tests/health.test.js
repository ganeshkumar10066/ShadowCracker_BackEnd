const request = require('supertest');
const app = require('../app');

describe('Health Check Endpoint', () => {
  it('should return 200 and server status', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body).toHaveProperty('code', 0);
    expect(response.body).toHaveProperty('msg', 'Server is running');
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('timestamp');
    expect(response.body.data).toHaveProperty('uptime');
    expect(response.body.data).toHaveProperty('environment');
  });

  it('should return 404 for non-existent routes', async () => {
    const response = await request(app)
      .get('/non-existent-route')
      .expect(404);

    expect(response.body).toHaveProperty('code', -1);
    expect(response.body).toHaveProperty('msg', 'Route not found');
  });
}); 