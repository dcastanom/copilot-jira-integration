import type { Request, Response } from 'express';
import { loginSchema } from '../dtos/auth.dto.js';
import type { AuthService } from '../services/auth.service.js';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  async login(req: Request, res: Response): Promise<Response> {
    try {
      const payload = loginSchema.parse(req.body);
      const tokens = await this.authService.login(payload);
      return res.status(200).json(tokens);
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'Invalid credentials') {
        console.warn(`Failed login attempt for email: ${String(req.body?.email ?? 'unknown')} at ${new Date().toISOString()}`);
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      return res.status(400).json({ error: 'Validation error' });
    }
  }
}
