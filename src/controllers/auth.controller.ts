import type { Request, Response } from 'express';
import { loginSchema } from '../dtos/auth.dto.js';
import type { AuthService } from '../services/auth.service.js';
import { logger } from '../utils/logger.js';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  async login(req: Request, res: Response): Promise<Response> {
    try {
      const payload = loginSchema.parse(req.body);
      const tokens = await this.authService.login(payload);
      return res.status(200).json(tokens);
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'Invalid credentials') {
        logger.warn('Failed login attempt', {
          email: String(req.body?.email ?? 'unknown'),
          outcome: 'invalid_credentials',
        });
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      return res.status(400).json({ error: 'Validation error' });
    }
  }

  async logout(req: Request, res: Response): Promise<Response> {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      logger.warn('Logout rejected: missing bearer token', {
        outcome: 'missing_token',
      });
      return res.status(401).json({ error: 'Invalid token' });
    }

    try {
      const result = await this.authService.logout(token);
      logger.info('Logout successful', {
        outcome: 'success',
      });
      return res.status(200).json(result);
    } catch {
      logger.warn('Logout rejected: invalid token', {
        outcome: 'invalid_token',
      });
      return res.status(401).json({ error: 'Invalid token' });
    }
  }
}
