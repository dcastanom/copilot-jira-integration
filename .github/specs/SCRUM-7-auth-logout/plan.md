# Implementation Plan: SCRUM-7 Auth Logout

**Branch**: `feature/SCRUM-7-auth-logout` | **Date**: 2026-08-15 | **Spec**: [.github/specs/stories/scrum-7-auth-logout.md](.github/specs/stories/scrum-7-auth-logout.md)

## Summary

Implement a logout endpoint for authenticated users that accepts a JWT, marks the token as revoked in a persisted blacklist table, and ensures that invalidated access and refresh tokens cannot be reused. The solution follows the repo’s layered architecture: controller validates the request and delegates to a service, which calls a repository that persists revocation state. The design keeps the security contract aligned with the constitution: explicit auth failures return 401, successful logout returns 200, and failed auth attempts are logged.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 18+
**Primary Dependencies**: Express, Zod, bcryptjs, jsonwebtoken, PostgreSQL
**Storage**: PostgreSQL with persisted token blacklist table
**Testing**: Vitest + Supertest
**Target Platform**: Node.js web service
**Project Type**: web-service
**Performance Goals**: Logout requests should complete in <200ms for normal traffic with minimal DB overhead
**Constraints**: Access token and refresh token must be invalidated; no plaintext secret logging; tokens must be rejected after logout; use explicit repository/service/controller boundaries
**Scale/Scope**: Single auth feature within user management system

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- ✅ Layered architecture satisfied: Controller -> Service -> Repository -> Model -> Database
- ✅ TypeScript strict mode is required and will be used in the implementation
- ✅ Security-by-default enforced: JWTs, bcrypt, DB-backed revocation, no token leakage
- ✅ Testing as documentation: unit and E2E tests will cover valid logout and invalid token cases
- ✅ Audit logging requirement preserved for failed auth events
- ✅ HTTP semantics aligned: 200 for successful logout, 401 for invalid token

## Project Structure

### Documentation (this feature)

```text
.github/specs/SCRUM-7-auth-logout/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── controllers/
│   └── auth.controller.ts
├── services/
│   └── auth.service.ts
├── repositories/
│   └── token-revocation.repository.ts
├── models/
│   ├── user.model.ts
│   └── revoked-token.model.ts
├── dtos/
│   └── auth.dto.ts
├── middleware/
│   └── auth.middleware.ts
├── config/
│   └── env.ts
├── index.ts
└── utils/
    └── logger.ts

tests/
├── unit/
│   └── auth.logout.service.spec.ts
├── e2e/
│   └── auth-logout.e2e.spec.ts
└── fixtures/
    └── auth.fixtures.ts
```

**Structure Decision**: Use the existing repo-aligned layered TypeScript structure with a dedicated revocation repository and explicit auth middleware, with tests under the standard unit/e2e layout.

## Complexity Tracking

No constitution violations were identified for this feature.
