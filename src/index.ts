import express, { type Express } from 'express';
import bcrypt from 'bcryptjs';
import { AuthController } from './controllers/auth.controller.js';
import { AuthService } from './services/auth.service.js';
import { UserRepository } from './repositories/user.repository.js';
import type { User } from './models/user.model.js';

export const app: Express = express();
app.use(express.json());

const seedUsers: User[] = [
  {
    id: 1,
    email: 'user@example.com',
    passwordHash: bcrypt.hashSync('Password123', 10),
    role: 'user',
    createdAt: new Date(),
  },
];

const authService = new AuthService(new UserRepository(seedUsers));
const authController = new AuthController(authService);

app.post('/auth/login', (req, res) => authController.login(req, res));

export default app;

if (process.argv[1]?.endsWith('index.ts') || process.argv[1]?.endsWith('index.js')) {
  const port = Number(process.env.PORT ?? 3000);
  app.listen(port, () => {
    console.log(`Auth server running on port ${port}`);
  });
}
