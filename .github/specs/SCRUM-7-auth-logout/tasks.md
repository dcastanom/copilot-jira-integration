# Tasks: SCRUM-7 Auth Logout

## Phase 1: Setup

- [ ] T001 Configure feature task tracking and confirm working directories under .github/specs/SCRUM-7-auth-logout/
- [ ] T002 [P] Review the current auth contract and app wiring in src/index.ts, src/services/auth.service.ts, src/controllers/auth.controller.ts, and tests/e2e/auth-login.e2e.spec.ts

## Phase 2: Foundational

- [ ] T003 Create the revoked token model in src/models/revoked-token.model.ts
- [ ] T004 [P] Implement the blacklist repository in src/repositories/token-revocation.repository.ts
- [ ] T005 [P] Extend the auth DTOs and validation contract in src/dtos/auth.dto.ts for logout tokens and error payloads
- [ ] T006 Wire the logout route into the app composition root in src/index.ts

## Phase 3: User Story 1 - Logout with persistent token revocation

### Story Goal
- Allow an authenticated user to log out by sending a valid JWT, persist the token ID in a revoke blacklist, and reject any reuse of that token.

### Independent Test Criteria
- A valid JWT can log the user out and returns 200 with a success payload.
- A revoked token is rejected with 401 on a later protected request.
- An invalid or expired token is rejected with 401.
- A refresh token is invalidated when the logout flow revokes the session.

- [ ] T007 [P] [US1] Add failing unit tests for logout success and invalid-token behavior in tests/unit/auth.logout.service.spec.ts
- [ ] T008 [P] [US1] Add failing E2E tests covering logout success and token reuse in tests/e2e/auth-logout.e2e.spec.ts
- [ ] T009 [US1] Implement token revocation logic in src/services/auth.service.ts to validate JWTs, store token IDs, and reject revoked tokens
- [ ] T010 [US1] Implement the logout controller flow in src/controllers/auth.controller.ts to parse the Authorization header and return the expected 200/401 responses
- [ ] T011 [US1] Add the logout validation contract and helper parsing logic in src/dtos/auth.dto.ts
- [ ] T012 [US1] Add middleware or request enforcement to check revoked tokens before protected routes in src/middleware/auth.middleware.ts
- [ ] T013 [US1] Add audit logging for failed logout and rejected-token attempts in src/utils/logger.ts or the controller/service layer
- [ ] T014 [US1] Confirm contract updates and OpenAPI documentation in .github/specs/SCRUM-7-auth-logout/contracts/auth-logout.openapi.yaml
- [ ] T015 [US1] Run the targeted logout test suite and fix any contract mismatches before closing the story

## Final Phase: Polish & Cross-Cutting Concerns

- [ ] T016 Review the logout flow against the constitution and the feature story for security, layering, and response consistency
- [ ] T017 Confirm all task IDs, file paths, and checkboxes follow the required checklist format and repository conventions

## Dependencies

- T001 → T002
- T003 → T009
- T004 → T009
- T005 → T010, T011
- T006 → T010
- T007, T008 → T015
- T009, T010, T011, T012, T013, T014 → T015
- T015 → T016, T017

## Parallel Execution Examples

- Parallel: T003, T004, T005, T006 can proceed once the auth app contract is reviewed.
- Parallel: T007 and T008 can be created together before the service/controller implementation.
- Parallel: T009 and T013 can be implemented concurrently once the token structure is defined.

## Implementation Strategy

- MVP first: implement logout request validation and blacklist storage for the current JWT.
- Incremental delivery: add revocation enforcement on protected routes and then extend to refresh-token invalidation.
- Final hardening: confirm audit logging, response shape, and regression coverage before closing the feature.
