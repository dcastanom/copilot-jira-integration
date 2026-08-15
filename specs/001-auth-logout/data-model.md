# Data Model: Auth Logout

## Entities

### RevokedToken

| Field | Type | Constraints | Notes |
| --- | --- | --- | --- |
| id | UUID | primary key | Unique revocation record |
| userId | integer | not null | User associated with the token |
| jti | string | unique, not null | JWT unique identifier |
| tokenType | enum('access', 'refresh') | not null | Distinguishes access and refresh tokens |
| revokedAt | timestamp | not null | Time the token was invalidated |
| expiresAt | timestamp | not null | Token expiration for cleanup |

### User

The existing user entity remains the primary auth subject for this flow.

## Relationships

- One user can have many revoked-token records.
- A revoked-token record is created when the logout route succeeds.
- Protected requests query the revocation table using the token's `jti` and `tokenType` before allowing access.

## Validation Rules

- `jti` is required and unique.
- `tokenType` must be either `access` or `refresh`.
- `revokedAt` must be populated at logout time.
- The revocation record is immutable after creation.
