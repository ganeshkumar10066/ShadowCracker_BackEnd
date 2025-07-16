const request = require('supertest');
const app = require('../app');
const config = require('../config/config');

describe('Payment Routes', () => {
  describe('GET /api/payment/get-price/:username', () => {
    it('should return 400 for missing username', async () => {
      const response = await request(app)
        .get('/api/payment/get-price/')
        .expect(404);
    });

    it('should return 400 for empty username', async () => {
      const response = await request(app)
        .get('/api/payment/get-price/   ')
        .expect(400);

      expect(response.body).toHaveProperty('code', -1);
      expect(response.body.msg).toContain('Username is required');
    });

    it('should return 200 for valid username', async () => {
      const response = await request(app)
        .get('/api/payment/get-price/testuser')
        .expect(200);

      expect(response.body).toHaveProperty('code');
      expect(response.body).toHaveProperty('msg');
      expect(response.body).toHaveProperty('data');
    });
  });

  describe('POST /api/payment/store-search-data', () => {
    it('should return 400 for missing data', async () => {
      const response = await request(app)
        .post('/api/payment/store-search-data')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('code', -1);
      expect(response.body.msg).toContain('Username and user data are required');
    });

    it('should return 400 for missing username', async () => {
      const response = await request(app)
        .post('/api/payment/store-search-data')
        .send({ userData: { test: 'data' } })
        .expect(400);

      expect(response.body).toHaveProperty('code', -1);
    });

    it('should return 400 for missing userData', async () => {
      const response = await request(app)
        .post('/api/payment/store-search-data')
        .send({ username: 'testuser' })
        .expect(400);

      expect(response.body).toHaveProperty('code', -1);
    });
  });

  describe('POST /api/payment/inquiry', () => {
    it('should return 400 for missing orderId', async () => {
      const response = await request(app)
        .post('/api/payment/inquiry')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('code', -1);
      expect(response.body.msg).toContain('Order ID is required');
    });

    it('should return 200 for valid orderId', async () => {
      const response = await request(app)
        .post('/api/payment/inquiry')
        .send({ orderId: 'TEST123' })
        .expect(200);

      expect(response.body).toHaveProperty('code');
      expect(response.body).toHaveProperty('msg');
      expect(response.body).toHaveProperty('data');
    });
  });

  describe('GET /api/payment/verify/:orderId', () => {
    it('should return 400 for missing orderId', async () => {
      const response = await request(app)
        .get('/api/payment/verify/')
        .expect(404);
    });

    it('should return 200 for valid orderId', async () => {
      const response = await request(app)
        .get('/api/payment/verify/TEST123')
        .expect(200);

      expect(response.body).toHaveProperty('code', 0);
      expect(response.body).toHaveProperty('msg', 'Payment verified successfully');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('password');
      expect(response.body.data).toHaveProperty('orderId', 'TEST123');
    });
  });
}); 