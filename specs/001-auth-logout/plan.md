# Implementation Plan: Auth Logout

**Branch**: `001-auth-logout` | **Date**: 2026-08-15 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-auth-logout/spec.md`

## Summary

Implement a logout endpoint that accepts a bearer JWT, records the token in a durable blacklist, and prevents reuse of the token on subsequent protected requests. The solution follows the repository/service/controller layering required by the project constitution and uses PostgreSQL-backed revocation data for security enforcement.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 18+

**Primary Dependencies**: Express, Zod, jsonwebtoken, bcryptjs, Vitest, Supertest, PostgreSQL

**Storage**: PostgreSQL with a persisted revoked-token table for access/refresh token invalidation

**Testing**: Vitest + Supertest

**Target Platform**: Node.js web service

**Project Type**: web-service

**Performance Goals**: Logout completes within 200 ms for normal traffic; blacklist lookup on protected requests remains lightweight

**Constraints**: Access token expiry 15 minutes; refresh token expiry 7 days; no plaintext secret logging; explicit 401 rejection for invalid tokens; layered architecture required

**Scale/Scope**: Single auth feature; small API with one user model and one revocation model

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- ✅ Layered architecture is satisfied: Controller -> Service -> Repository -> Model -> Database
- ✅ Type safety is required and the repo uses strict TypeScript
- ✅ Security-by-default is preserved: JWT validation, revocation checks, audit logging, no token leakage
- ✅ Testing is required and must cover valid logout and invalid-token scenarios
- ✅ Error handling aligns with HTTP semantics: 200 for success, 401 for invalid/expired tokens
- ✅ The feature scope remains within the authorization boundary and does not break the project’s auth model

## Project Structure

### Documentation (this feature)

```text
specs/001-auth-logout/
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
│   ├── user.repository.ts
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

**Structure Decision**: Use the existing repo-aligned TypeScript layering with a dedicated token revocation repository and explicit auth middleware, plus unit and E2E tests under the repo’s existing structure.

## Complexity Tracking

No constitution violations were identified for this feature.
