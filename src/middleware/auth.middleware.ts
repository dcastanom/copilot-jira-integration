import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import type { TokenRevocationRepository } from '../repositories/token-revocation.repository.js';
import { logger } from '../utils/logger.js';

export function authMiddleware(tokenRevocationRepository: TokenRevocationRepository) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const authorization = req.headers.authorization;
    const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null;

    if (!token) {
      logger.warn('Protected route rejected: missing token', { outcome: 'missing_token' });
      next(new Error('Invalid token'));
      return;
    }

    try {
      const decoded = jwt.decode(token) as { type?: string; jti?: string } | null;

      if (!decoded || typeof decoded !== 'object' || decoded.type !== 'access' || !decoded.jti) {
        throw new Error('Invalid token');
      }

      if (await tokenRevocationRepository.isRevoked(decoded.jti)) {
        logger.warn('Protected route rejected: revoked token', { jti: decoded.jti, outcome: 'invalid_token' });
        next(new Error('Invalid token'));
        return;
      }

      next();
    } catch {
      logger.warn('Protected route rejected: malformed token', { outcome: 'invalid_token' });
      next(new Error('Invalid token'));
    }
  };
}
