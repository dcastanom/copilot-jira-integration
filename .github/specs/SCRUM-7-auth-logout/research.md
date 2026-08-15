# Research: SCRUM-7 Auth Logout

## Decision

Use a PostgreSQL-backed blacklist table for revoked tokens, keyed on token identifier or JTI, with a repository method to add and check revoked tokens. The logout endpoint will accept a bearer token, validate it, and persist the token identifier so subsequent requests reject it.

## Rationale

- The constitution requires explicit token revocation and auditability.
- A database table gives durable enforcement and aligns with the repository/service/controller pattern.
- It is easier to test and reason about than in-memory or process-local state.
- A JTI-based approach prevents accidental blacklist collisions and allows invalidation of both access and refresh tokens.

## Alternatives considered

- Redis-only blacklist: simple but less aligned with the repo’s PostgreSQL-first data model and less auditable than DB-backed storage.
- In-memory blacklist: too weak for multi-instance deployments and fails the persistence requirement.
- Short expiration only: insufficient because the story explicitly demands token invalidation after logout.

## Operational notes

- Store the token’s unique identifier (jti) and token type (access/refresh) with a revocation timestamp.
- Re-check blacklist on each authenticated request in middleware before trusting the token.
- Log failed logout attempts and rejected token reuse with user context when available.
