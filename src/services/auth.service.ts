import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import type { LoginDTO, AuthTokensResponse } from '../dtos/auth.dto.js';
import type { RevokedToken, TokenType } from '../models/revoked-token.model.js';
import type { TokenRevocationRepository } from '../repositories/token-revocation.repository.js';
import type { UserRepository } from '../repositories/user.repository.js';
import { logger } from '../utils/logger.js';

export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenRevocationRepository: TokenRevocationRepository
  ) {}

  async login({ email, password }: LoginDTO): Promise<AuthTokensResponse> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      logger.warn('Login rejected: user not found', { email, outcome: 'invalid_credentials' });
      throw new Error('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      logger.warn('Login rejected: wrong password', { email, outcome: 'invalid_credentials' });
      throw new Error('Invalid credentials');
    }

    const accessToken = jwt.sign(
      { sub: user.id, email: user.email, jti: randomUUID(), type: 'access' },
      this.getSecretForTokenType('access'),
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { sub: user.id, type: 'refresh', jti: randomUUID() },
      this.getSecretForTokenType('refresh'),
      { expiresIn: '7d' }
    );

    logger.info('Login successful', { email, outcome: 'success' });

    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60,
    };
  }

  async logout(token: string): Promise<{ message: string }> {
    const payload = this.verifyToken(token);

    if (payload.jti === undefined || payload.sub === undefined) {
      throw new Error('Invalid token');
    }

    if (await this.tokenRevocationRepository.isRevoked(payload.jti)) {
      logger.warn('Logout rejected: token already revoked', {
        jti: String(payload.jti),
        outcome: 'invalid_token',
      });
      throw new Error('Invalid token');
    }

    const tokenType: TokenType = payload.type === 'refresh' ? 'refresh' : 'access';
    const expiresAt = payload.exp === undefined ? new Date() : new Date(payload.exp * 1000);

    const revokedToken: RevokedToken = {
      jti: payload.jti,
      subject: Number(payload.sub),
      type: tokenType,
      revokedAt: new Date(),
      expiresAt,
    };

    await this.tokenRevocationRepository.revoke(revokedToken);

    logger.info('Logout successful', {
      jti: String(payload.jti),
      subject: Number(payload.sub),
      tokenType,
      outcome: 'success',
    });

    return { message: 'Logout successful' };
  }

  private verifyToken(token: string): JwtPayload {
    try {
      const decoded = jwt.decode(token) as JwtPayload | null;

      if (!decoded || typeof decoded !== 'object' || decoded.type === undefined) {
        throw new Error('Invalid token');
      }

      if (decoded.type !== 'access' && decoded.type !== 'refresh') {
        throw new Error('Invalid token');
      }

      const secret = this.getSecretForTokenType(decoded.type === 'refresh' ? 'refresh' : 'access');
      const payload = jwt.verify(token, secret) as JwtPayload;

      if (payload.jti === undefined || payload.sub === undefined) {
        throw new Error('Invalid token');
      }

      return payload;
    } catch {
      throw new Error('Invalid token');
    }
  }

  private getSecretForTokenType(type: TokenType): string {
    const secret = type === 'refresh' ? process.env.JWT_REFRESH_SECRET : process.env.JWT_SECRET;

    if (!secret) {
      throw new Error('JWT secret is not configured');
    }

    return secret;
  }
}
