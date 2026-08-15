# Tasks: Auth Logout

**Input**: Design documents from `/specs/001-auth-logout/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm the active feature context and establish the logout implementation boundary.

- [ ] T001 Confirm the feature directory and design documents under specs/001-auth-logout/
- [ ] T002 [P] Review the current auth flow in src/index.ts, src/services/auth.service.ts, src/controllers/auth.controller.ts, and src/dtos/auth.dto.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create the reusable revocation and validation building blocks before implementing the logout story.

- [ ] T003 Create the revoked-token model in src/models/revoked-token.model.ts
- [ ] T004 [P] Implement the revocation repository in src/repositories/token-revocation.repository.ts
- [ ] T005 [P] Extend the auth DTO contract in src/dtos/auth.dto.ts with logout validation and response payloads
- [ ] T006 Wire the logout route and dependency setup into src/index.ts
- [ ] T007 Create the revocation enforcement hook in src/middleware/auth.middleware.ts

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - User logs out successfully with a valid token (Priority: P1) 🎯 MVP

**Goal**: Allow a valid authenticated user to log out and invalidate the current JWT so it cannot be reused.

**Independent Test**: A user can call POST /auth/logout with a valid token and then see the same token rejected on a protected request.

### Tests for User Story 1

- [ ] T008 [P] [US1] Add unit tests for successful logout and invalid-token handling in tests/unit/auth.logout.service.spec.ts
- [ ] T009 [P] [US1] Add E2E tests for logout success and token reuse rejection in tests/e2e/auth-logout.e2e.spec.ts

### Implementation for User Story 1

- [ ] T010 [US1] Implement token revocation logic in src/services/auth.service.ts to validate JWTs, persist blacklist entries, and reject revoked tokens
- [ ] T011 [US1] Implement the logout HTTP controller in src/controllers/auth.controller.ts to parse the Authorization header and return 200/401 responses
- [ ] T012 [US1] Add auth enforcement for revoked tokens in src/middleware/auth.middleware.ts before protected requests proceed
- [ ] T013 [US1] Add audit logging for failed logout attempts and revoked-token rejections in src/controllers/auth.controller.ts and src/services/auth.service.ts
- [ ] T014 [US1] Update the logout contract in specs/001-auth-logout/contracts/auth-logout.openapi.yaml to match the final API behavior
- [ ] T015 [US1] Run the focused logout unit and E2E tests and fix any contract mismatches

**Checkpoint**: User Story 1 should be fully functional and independently testable

---

## Phase 4: User Story 2 - Invalid or expired token is rejected (Priority: P1)

**Goal**: Ensure malformed, expired, missing, and untrusted tokens are rejected consistently.

**Independent Test**: A client can send invalid or expired JWTs to POST /auth/logout and receive 401 without leaking sensitive information.

### Tests for User Story 2

- [ ] T016 [P] [US2] Extend unit coverage for expired and malformed token rejection in tests/unit/auth.logout.service.spec.ts
- [ ] T017 [P] [US2] Extend E2E coverage for invalid-token login/logout requests in tests/e2e/auth-logout.e2e.spec.ts

### Implementation for User Story 2

- [ ] T018 [US2] Harden validation and error handling in src/controllers/auth.controller.ts for missing or malformed Authorization headers
- [ ] T019 [US2] Ensure logout validation in src/services/auth.service.ts rejects expired and malformed JWTs with the correct 401 contract
- [ ] T020 [US2] Confirm the blacklist check prevents already-revoked tokens from being processed again in src/middleware/auth.middleware.ts

**Checkpoint**: Invalid token handling is consistent and testable without relying on other story flows

---

## Phase 5: User Story 3 - Refresh token revocation is enforced (Priority: P2)

**Goal**: Prevent a logged-out user from continuing a refresh session with a revoked refresh token.

**Independent Test**: After logout, the old refresh token no longer works for token refresh.

### Tests for User Story 3

- [ ] T021 [P] [US3] Add refresh-token revocation unit tests in tests/unit/auth.logout.service.spec.ts
- [ ] T022 [P] [US3] Add refresh-token revocation E2E tests in tests/e2e/auth-logout.e2e.spec.ts

### Implementation for User Story 3

- [ ] T023 [US3] Enhance the revocation logic in src/services/auth.service.ts to record both access and refresh token `jti` values
- [ ] T024 [US3] Update the middleware or protected-route enforcement in src/middleware/auth.middleware.ts to reject revoked refresh tokens during refresh processing
- [ ] T025 [US3] Validate the final behavior against the spec requirements in specs/001-auth-logout/spec.md and the API contract in specs/001-auth-logout/contracts/auth-logout.openapi.yaml

**Checkpoint**: Refresh token invalidation is enforced and independently verified

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final consistency checks against the constitution, project rules, and validation guide.

- [ ] T026 Review the logout implementation against the constitution in constitution.md for layering, security, and error semantics
- [ ] T027 [P] Validate the end-to-end run guide in specs/001-auth-logout/quickstart.md against the actual app behavior
- [ ] T028 [P] Confirm all task IDs, story labels, and file paths follow the required checklist format and repository conventions

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (Phase 1): No dependencies
- Foundational (Phase 2): Depends on Setup completion and blocks all user-story work
- User Stories (Phase 3+): All depend on Foundational completion
- Polish (Phase 6): Depends on all desired story work being complete

### User Story Dependencies

- User Story 1 (US1): Can start after Phase 2 and does not depend on other stories
- User Story 2 (US2): Can start after Phase 2 and strengthens the same auth flow
- User Story 3 (US3): Can start after Phase 2 and builds on the same revocation model

### Parallel Opportunities

- T004 and T005 can be implemented in parallel once the auth contract is reviewed.
- T008 and T009 can be written in parallel before implementation.
- T016 and T017 can be implemented together for invalid-token coverage.
- T021 and T022 can be developed together for refresh-token revocation coverage.
- T027 and T028 can run in parallel during the final validation pass.

---

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2
2. Implement User Story 1 (logout success + token invalidation)
3. Validate the logout scenario independently
4. Add invalid-token and refresh-token guard rails

### Incremental Delivery

1. Add the foundational revocation model and repository.
2. Implement the core logout flow.
3. Enforce invalid-token rejection.
4. Extend to refresh-token revocation.
5. Final polish and validation against the quickstart and constitution.
