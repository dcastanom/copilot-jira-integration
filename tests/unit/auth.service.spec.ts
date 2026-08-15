import { describe, expect, it } from 'vitest';
import bcrypt from 'bcryptjs';
import { AuthService } from '../../src/services/auth.service.js';
import { UserRepository } from '../../src/repositories/user.repository.js';
import type { User } from '../../src/models/user.model.js';

describe('AuthService', () => {
  it('returns tokens for valid credentials', async () => {
    const users: User[] = [
      {
        id: 1,
        email: 'user@example.com',
        passwordHash: await bcrypt.hash('Password123', 10),
      },
    ];

    const service = new AuthService(new UserRepository(users));
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

    const service = new AuthService(new UserRepository(users));

    await expect(
      service.login({ email: 'user@example.com', password: 'WrongPassword' })
    ).rejects.toThrow('Invalid credentials');
  });
});
