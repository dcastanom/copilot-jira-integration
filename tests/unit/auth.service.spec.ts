import { beforeEach, describe, expect, it } from 'vitest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthService } from '../../src/services/auth.service.js';
import { UserRepository } from '../../src/repositories/user.repository.js';
import { TokenRevocationRepository } from '../../src/repositories/token-revocation.repository.js';
import type { User } from '../../src/models/user.model.js';

describe('AuthService', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-access-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
  });

  it('returns tokens for valid credentials', async () => {
    const users: User[] = [
      {
        id: 1,
        email: 'user@example.com',
        passwordHash: await bcrypt.hash('Password123', 10),
      },
    ];

    const service = new AuthService(new UserRepository(users), new TokenRevocationRepository());
    const result = await service.login({ email: 'user@example.com', password: 'Password123' });

    expect(result.accessToken).toBeTruthy();
    expect(result.refreshToken).toBeTruthy();
    expect(result.expiresIn).toBe(900);
  });

  it('throws invalid credentials for wrong password', async () => {
    const users: User[] = [
      {
        id: 1,
        email: 'user@example.com',
        passwordHash: await bcrypt.hash('Password123', 10),
      },
    ];

    const service = new AuthService(new UserRepository(users), new TokenRevocationRepository());

    await expect(
      service.login({ email: 'user@example.com', password: 'WrongPassword' })
    ).rejects.toThrow('Invalid credentials');
  });

  it('revokes a valid access token and rejects it on reuse', async () => {
    const users: User[] = [
      {
        id: 1,
        email: 'user@example.com',
        passwordHash: await bcrypt.hash('Password123', 10),
      },
    ];

    const service = new AuthService(new UserRepository(users), new TokenRevocationRepository());
    const result = await service.login({ email: 'user@example.com', password: 'Password123' });

    await expect(service.logout(result.accessToken)).resolves.toEqual({ message: 'Logout successful' });
    await expect(service.logout(result.accessToken)).rejects.toThrow('Invalid token');
  });

  it('rejects expired tokens during logout', async () => {
    const expiredToken = jwt.sign(
      { sub: 1, jti: 'expired-jti', type: 'access', email: 'user@example.com' },
      'test-access-secret',
      { expiresIn: '-1s' }
    );

    const service = new AuthService(new UserRepository([]), new TokenRevocationRepository());

    await expect(service.logout(expiredToken)).rejects.toThrow('Invalid token');
  });
});
