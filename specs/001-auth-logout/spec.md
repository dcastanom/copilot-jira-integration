# Feature Specification: Auth Logout

**Feature Branch**: `001-auth-logout`

**Created**: 2026-08-15

**Status**: Draft

**Input**: User description: "Implement auth logout"

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.

  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - User logs out successfully with a valid token (Priority: P1)

A logged-in user sends a valid JWT to the logout endpoint and expects the current session to be invalidated immediately.

**Why this priority**: This is the core user action for secure sign-out and protects the application from continued use of active tokens after a user exits the session.

**Independent Test**: A user can call POST /auth/logout with a valid access token and receive a success response that confirms the session was terminated, while the token is no longer accepted by protected endpoints.

**Acceptance Scenarios**:

1. **Given** a user has a valid access token, **When** they send POST /auth/logout with that token, **Then** the system returns 200 and a success message.
2. **Given** the user has already logged out, **When** they reuse that same token on a protected route, **Then** the system rejects the request with 401.

---

### User Story 2 - Invalid or expired token is rejected (Priority: P1)

A client attempts to log out with a malformed, expired, or untrusted token and receives a clear authentication error.

**Why this priority**: This prevents silent acceptance of invalid auth inputs and keeps token validation behavior consistent with the security model.

**Independent Test**: A request with an expired or malformed token returns 401 without leaking sensitive information.

**Acceptance Scenarios**:

1. **Given** the token is expired or malformed, **When** POST /auth/logout is called, **Then** the system returns 401 with an invalid token error.
2. **Given** the token is missing from the Authorization header, **When** the logout route is called, **Then** the system returns 401 and does not revoke any user session.

---

### User Story 3 - Refresh token revocation is enforced (Priority: P2)

The system ensures that a user's refresh token is also invalidated when the logout flow revokes the authenticated session.

**Why this priority**: Refresh tokens remain valid long enough to reissue access tokens, so they must be revoked as part of logout to prevent session reactivation.

**Independent Test**: A user who logs out cannot continue to refresh an access token using the previously issued refresh token.

**Acceptance Scenarios**:

1. **Given** a user has both access and refresh tokens, **When** they logout, **Then** both token types are marked revoked in the blacklist store.
2. **Given** the refresh token has been revoked, **When** the client attempts a refresh flow, **Then** the system denies the request.

---

### Edge Cases

- What happens when the Authorization header is absent or formatted incorrectly?
- How does the system handle a token whose subject or type does not match the current user session?
- What happens when the token is valid but already present in the blacklist?
- How does the system respond when the revocation database write fails during logout?
- How does the system handle a logout request for an expired token without exposing server internals?

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: The system MUST accept a bearer JWT in the Authorization header for the logout endpoint.
- **FR-002**: The system MUST validate the provided JWT before allowing logout to complete.
- **FR-003**: The system MUST persist a token revocation record for the current token in a database-backed blacklist when logout succeeds.
- **FR-004**: The system MUST reject any request that reuses a revoked token with a 401 unauthorized response.
- **FR-005**: The system MUST return 200 with a success message when logout succeeds.
- **FR-006**: The system MUST return 401 with an invalid token error for expired, malformed, missing, or otherwise untrusted tokens.
- **FR-007**: The system MUST revoke both access and refresh tokens associated with the authenticated session when the logout flow completes.
- **FR-008**: The system MUST log failed authentication and revocation attempts without exposing passwords or raw tokens.
- **FR-009**: The application MUST enforce the revocation check before processing protected requests that rely on JWT authentication.

### Key Entities *(include if feature involves data)*

- **User**: The authenticated subject whose tokens are being revoked.
- **RevokedToken**: A persisted record containing the user identifier, token identifier, token type, revocation time, and expiration metadata.
- **JWT**: The bearer token used to assert identity and session validity for login/logout flows.

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: A valid logout request completes in under 200 ms under normal request volume for a single authenticated user.
- **SC-002**: A revoked token is rejected with 401 on any subsequent protected request until the token expires.
- **SC-003**: At least 100% of logout acceptance scenarios in the feature spec are covered by automated tests for success, invalid-token, and post-logout reuse.
- **SC-004**: Failed logout and invalid-token attempts are logged with user context and outcome, without storing plaintext secrets or raw JWT values.

## Assumptions

- Users are already authenticated before calling the logout endpoint, and the application already issues JWT access and refresh tokens.
- The project uses PostgreSQL as the persistent store for revocation metadata, even though the current app remains in-memory for login-only behavior.
- The logout feature is scoped to token invalidation and session termination; it does not introduce additional user-management flows such as session listing or bulk revoke.
- The system will continue to use bearer JWTs and will not introduce cookie-only or session-based auth as part of this feature.
- Existing auth middleware and token generation behavior are reused as the baseline for logout enforcement, with the blacklist check added as a security gate.
