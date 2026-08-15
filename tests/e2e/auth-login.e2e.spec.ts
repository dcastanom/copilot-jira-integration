import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import app from '../../src/index.js';

beforeEach(() => {
  process.env.JWT_SECRET = 'test-access-secret';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
});

describe('POST /auth/login', () => {
  it('returns 200 with accessToken, refreshToken and expiresIn when credentials are valid', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'user@example.com', password: 'Password123' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
    expect(response.body.expiresIn).toBe(900);
  });

  it('returns 401 when password is invalid', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'user@example.com', password: 'WrongPassword' });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'Invalid credentials' });
  });

  it('returns 401 when user does not exist', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'nonexistent@example.com', password: 'Password123' });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'Invalid credentials' });
  });
});

describe('POST /auth/logout', () => {
  it('returns 200 then 401 when a token is reused after logout', async () => {
    const loginResponse = await request(app)
      .post('/auth/login')
      .send({ email: 'user@example.com', password: 'Password123' });

    expect(loginResponse.status).toBe(200);

    const logoutResponse = await request(app)
      .post('/auth/logout')
      .set('Authorization', `Bearer ${loginResponse.body.accessToken}`);

    expect(logoutResponse.status).toBe(200);
    expect(logoutResponse.body).toEqual({ message: 'Logout successful' });

    const reusedResponse = await request(app)
      .post('/auth/logout')
      .set('Authorization', `Bearer ${loginResponse.body.accessToken}`);

    expect(reusedResponse.status).toBe(401);
    expect(reusedResponse.body).toEqual({ error: 'Invalid token' });
  });

  it('returns 401 when the bearer token is missing or malformed', async () => {
    const response = await request(app)
      .post('/auth/logout')
      .set('Authorization', 'Bearer invalid-token');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'Invalid token' });
  });

  it('returns 401 for an expired bearer token', async () => {
    const expiredToken = require('jsonwebtoken').sign(
      { sub: 1, jti: 'expired-token', type: 'access', email: 'user@example.com' },
      'test-access-secret',
      { expiresIn: '-1s' }
    );

    const response = await request(app)
      .post('/auth/logout')
      .set('Authorization', `Bearer ${expiredToken}`);

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'Invalid token' });
  });
});
