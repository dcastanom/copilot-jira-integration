# Quickstart: Auth Logout

## Prerequisites

- Node.js 18+
- Existing auth login flow returning valid JWTs
- PostgreSQL reachable by the application
- JWT secret configured in the environment

## Validation scenarios

1. Successful logout
   - Obtain a valid access token.
   - Send POST /auth/logout with the Authorization: Bearer token header.
   - Expect 200 and a success message.
   - Reuse the same token on a protected route and expect 401.

2. Invalid token rejection
   - Send an expired or malformed token to POST /auth/logout.
   - Expect 401 and an invalid-token error payload.

3. Refresh token invalidation
   - Log out using a valid session.
   - Attempt to refresh using the old refresh token.
   - Expect the refresh request to fail.

## Validation commands

```bash
npm test -- tests/unit/auth.logout.service.spec.ts
npm test -- tests/e2e/auth-logout.e2e.spec.ts
```
