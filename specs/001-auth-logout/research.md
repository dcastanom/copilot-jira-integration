# Research: Auth Logout

## Decision

Use a PostgreSQL-backed revocation table keyed by JWT `jti` and token type. The logout flow will validate the bearer token, persist its unique identifier in the blacklist, and enforce the blacklist check in the auth middleware before processing protected requests.

## Rationale

- The constitution requires durable token revocation and auditability.
- A database-backed blacklist allows token invalidation to survive process restarts and multiple instances.
- Storing `jti` and `tokenType` avoids collisions between access and refresh tokens.
- This aligns with the repo’s layered design and keeps invalidation logic out of the controller.

## Alternatives considered

- In-memory token blacklist: rejected because it is ephemeral and not suitable for multi-instance deployments.
- Short expiry-only strategy: rejected because the story explicitly requires post-logout rejection.
- Redis-only blacklist: considered, but rejected because the project’s data model and constitution prefer PostgreSQL-backed persistence.

## Operational notes

- Token-type and `jti` should be included in the persisted blacklist record.
- Rejected-token checks must happen in middleware or before business logic for protected routes.
- Failed revocations and rejected-token requests should be logged without storing raw tokens or secrets.
