import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { LoginDTO, AuthTokensResponse } from '../dtos/auth.dto.js';
import type { UserRepository } from '../repositories/user.repository.js';

export class AuthService {
  constructor(private readonly userRepository: UserRepository) {}

  async login({ email, password }: LoginDTO): Promise<AuthTokensResponse> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      throw new Error('Invalid credentials');
    }

    const accessToken = jwt.sign(
      { sub: user.id, email: user.email },
      process.env.JWT_SECRET ?? 'dev-secret',
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { sub: user.id, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret',
      { expiresIn: '7d' }
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60,
    };
  }
}
