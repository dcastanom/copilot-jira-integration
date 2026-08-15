# Data Model: SCRUM-7 Auth Logout

## Entities

### RevokedToken

| Field | Type | Constraints | Notes |
| --- | --- | --- | --- |
| id | UUID | primary key | Unique token revocation record |
| userId | integer | not null | User whose token was revoked |
| jti | string | unique, not null | JWT unique identifier |
| tokenType | enum('access', 'refresh') | not null | Distinguishes access vs refresh token |
| revokedAt | timestamp | not null | Time the token was invalidated |
| expiresAt | timestamp | not null | Token expiration for cleanup |

### User

The existing user model remains the canonical auth subject and is referenced by userId when a token is revoked.

## Relationships

- One user can have many revoked tokens.
- A token revocation record is created when user logs out.
- Middleware checks revoked tokens before accepting an authenticated request.

## Validation Rules

- jti must be present and unique.
- tokenType must be access or refresh.
- revokedAt must be set at logout time.
- The revocation record should be immutable once created.
