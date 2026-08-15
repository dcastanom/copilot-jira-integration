# Quickstart: SCRUM-7 Auth Logout

## Prerequisites

- Node.js 18+
- PostgreSQL accessible for the app
- JWT secret configured in environment
- Application running with auth middleware enabled

## Validation scenarios

1. Successful logout
   - Obtain a valid JWT for a user.
   - Send `POST /auth/logout` with the token in the Authorization header.
   - Expected: `200` with `{ message: 'Logged out successfully' }`.

2. Token reuse after logout
   - Use the same token to call a protected endpoint.
   - Expected: `401` with `{ error: 'Invalid token' }`.

3. Invalid token case
   - Send an expired or malformed token.
   - Expected: `401` with `{ error: 'Invalid token' }`.

4. Refresh token revocation
   - Log out with a refresh token.
   - Expected: the refresh token is rejected on subsequent refresh requests.
