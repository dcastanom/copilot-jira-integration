import request from 'supertest';
import { describe, expect, it } from 'vitest';
import app from '../../src/index.js';

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
