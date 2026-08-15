# Copilot Instructions

## Build, run, and test

```bash
npm install
npm run dev
npm run build
npm start
npm test
npm test -- tests\unit\auth.service.spec.ts
npm test -- tests\e2e\auth-login.e2e.spec.ts
```

There is currently no lint script or ESLint/Prettier setup in the repository root.

## High-level architecture

- This repository is a small TypeScript + Express auth slice organized as layered classes: `AuthController` -> `AuthService` -> `UserRepository` -> `User` model.
- `src\index.ts` is both the app composition root and the local runtime entrypoint. It creates the Express app, enables JSON parsing, seeds an in-memory user list, wires the repository/service/controller instances, and registers `POST /auth/login`.
- The app only starts listening when `src\index.ts` or `dist\index.js` is executed directly. Tests import the exported `app` and hit the route in-process with Supertest instead of starting a server.
- Request validation lives in DTO/schema files. `src\dtos\auth.dto.ts` defines the Zod login schema and the response contract, and `AuthController.login()` parses the request body before calling the service.
- `AuthService.login()` owns credential verification and token creation. It looks up the user through the repository, compares passwords with `bcryptjs`, and returns `{ accessToken, refreshToken, expiresIn }` using a 15-minute access token and 7-day refresh token.
- Current persistence is in-memory only even though the broader project docs describe PostgreSQL. If you introduce real database access, keep the controller/service/repository boundaries intact and update both unit and e2e tests together.

## Key conventions

- Follow the layered architecture defined in `constitution.md` and `.github\agents\AGENTS.md`: controllers should not access repositories directly, services should stay free of Express request/response concerns, and repositories should stay focused on data access.
- Keep NodeNext-style ESM imports with explicit `.js` extensions in TypeScript source and tests.
- Prefer Zod schemas in `src\dtos\*.dto.ts` and infer request types from those schemas instead of duplicating request interfaces.
- Auth failures currently flow through a specific convention: `AuthService` throws `Error('Invalid credentials')`, and `AuthController` maps only that message to HTTP 401 while logging the failed email. Other controller failures currently return HTTP 400 as validation errors.
- The seeded user in `src\index.ts` (`user@example.com` / `Password123`) is part of the current test contract. The e2e suite depends on those exact credentials.
- Response shape is part of the test contract: login must return `accessToken`, `refreshToken`, and `expiresIn`, and the current tests assert `expiresIn === 900`.
- Feature work is expected to stay spec-driven. Before implementing new behavior, check the matching story under `.github\specs\stories\` and keep tests aligned with its acceptance criteria and Gherkin scenarios.
