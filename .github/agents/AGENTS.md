# AGENTS.md - Spec Kit Agent Instructions (Layer-Based Architecture)

---

## Enhancement Skills (Enabled)

### ☑ /speckit-clarify
**Purpose:** Ask structured questions to de-risk ambiguous areas before planning

**When to use:** After /speckit.specify, before /speckit.plan

**What it does:**
- Identifies ambiguous acceptance criteria
- Asks clarifying questions about edge cases
- Validates technical feasibility
- Ensures no critical details are missing

**Example:**
```
Story SCRUM-6: Implement login endpoint

/speckit-clarify asks:
- What should happen if user tries to login 5 times with wrong password?
- Should JWT expiration be checked per-request or per-session?
- What's the refresh token rotation policy?
- Should failed attempts be logged to database or just application logs?
```

**Output:** Refined spec with all ambiguities resolved before planning

---

### ☑ /speckit-checklist
**Purpose:** Generate quality checklists to validate requirements completeness, clarity, and consistency

**When to use:** After /speckit.plan, before /speckit.tasks

**What it does:**
- Validates completeness of acceptance criteria
- Checks for consistency across specs
- Ensures technical context is sufficient
- Identifies missing test scenarios
- Checks for security/performance concerns

**Example output for SCRUM-6:**
```
✅ Acceptance Criteria Completeness Check:
  ✓ Happy path covered (login success)
  ✓ Error paths covered (invalid credentials)
  ✓ Security considerations (password hashing, JWT expiry)
  ✓ Edge cases mentioned (rate limiting for failed attempts)

✅ Test Scenario Coverage:
  ✓ Valid email + password
  ✓ Invalid password
  ✓ Non-existent user
  ⚠️ Missing: User lockout after N failed attempts
  ⚠️ Missing: Concurrent login scenarios

✅ Technical Context:
  ✓ Database layer specified
  ✓ Authentication method specified (JWT)
  ✓ Password hashing algorithm specified (bcrypt)
  ⚠️ Missing: Rate limiting configuration

✅ Security Checklist:
  ✓ Password hashing mentioned
  ✓ Token expiration mentioned
  ⚠️ Missing: CORS configuration for login endpoint
  ⚠️ Missing: SQL injection prevention notes
```

---

## Workflow with Enhancement Skills

```
Phase 1: /speckit.specify
  Read spec from .md file
  ↓
Phase 1b: /speckit-clarify (NEW)
  Ask ambiguous questions
  Refine spec based on answers
  ↓ (if clarifications needed, loop back)
  ↓
Phase 2: /speckit.plan
  Create technical implementation plan
  ↓
Phase 2b: /speckit-checklist (NEW)
  Validate completeness
  Flag missing items
  ↓ (if gaps found, request additions)
  ↓
Phase 3: /speckit.tasks
  Break into atomic tasks
  ↓
Phase 4: /speckit.implement
  Generate and place code
  Update .md file
  Create PR
```

---

## When to Use Enhancement Skills

### Use /speckit-clarify if:
- Spec has vague language ("should be fast", "user-friendly")
- Acceptance criteria lacks edge cases
- Technical approach is unclear
- Security/performance concerns are not addressed
- Multiple interpretations of a requirement are possible

### Use /speckit-checklist if:
- You want to validate completeness before coding
- You want to catch missing test scenarios early
- You want a quality gate before /speckit.tasks
- You want to ensure no security blind spots

### Skip them if:
- Spec is very simple and clear (SCRUM-24: "Listar productos" with clear ACs)
- You're short on time (can always add clarity during code review)

---



```
copilot-jira-integration/
├── src/
│   ├── controllers/         ← HTTP endpoints / routes
│   ├── services/            ← Business logic
│   ├── repositories/        ← Data access layer
│   ├── models/              ← Database schemas
│   ├── dtos/                ← Request/Response DTOs
│   ├── middleware/          ← Auth, validation, error handling
│   ├── types/               ← TypeScript interfaces
│   ├── utils/               ← Helpers, constants
│   ├── config/              ← Environment, database config
│   └── index.ts             ← App entry point
├── tests/
│   ├── unit/                ← Service/repository tests
│   ├── e2e/                 ← API endpoint tests
│   └── fixtures/            ← Test data
├── .github/
│   ├── specs/
│   │   ├── stories/         ← User stories
│   │   └── epics/           ← Epics
│   ├── agents/
│   │   └── AGENTS.md        ← This file
│   └── workflows/           ← GitHub Actions
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

---

## Code Placement Rules

### When implementing a story, place code in:

#### CONTROLLERS
```
File: src/controllers/{FEATURE}.controller.ts
Pattern: 
  - Class name: {Feature}Controller
  - Methods: POST, GET, PUT, DELETE
  - Request validation: @Body() dto: CreateXxxDTO
  - Response: res.status(200).json(data)
  
Example (SCRUM-6 Auth Login):
  File: src/controllers/auth.controller.ts
  Class: AuthController
  Method: @Post('/login') async login(@Body() dto: LoginDTO)
```

#### SERVICES
```
File: src/services/{FEATURE}.service.ts
Pattern:
  - Class name: {Feature}Service
  - Business logic only
  - No HTTP details
  - Methods: validate, create, update, delete, etc
  
Example (SCRUM-6):
  File: src/services/auth.service.ts
  Class: AuthService
  Methods: validateCredentials(), generateToken(), hashPassword()
```

#### REPOSITORIES
```
File: src/repositories/{FEATURE}.repository.ts
Pattern:
  - Class name: {Feature}Repository
  - Database queries only
  - Reusable query methods
  - No business logic
  
Example (SCRUM-6):
  File: src/repositories/user.repository.ts
  Class: UserRepository
  Methods: findByEmail(), create(), update(), delete()
```

#### MODELS / SCHEMAS
```
File: src/models/{FEATURE}.model.ts
Pattern:
  - Interface or Entity
  - Database schema definition
  - Field types and constraints
  
Example (SCRUM-6):
  File: src/models/user.model.ts
  Interface: IUser
  Fields: id, email, password_hash, role, created_at
```

#### DTOs (Request/Response)
```
File: src/dtos/{FEATURE}.dto.ts
Pattern:
  - Class name: {Feature}DTO, Create{Feature}DTO, Update{Feature}DTO
  - Validation decorators
  - Documentation
  
Example (SCRUM-6):
  File: src/dtos/auth.dto.ts
  Classes: LoginDTO, ChangePasswordDTO, AuthResponseDTO
  Fields: email, password (with @IsEmail(), @MinLength(8) etc)
```

#### MIDDLEWARE
```
File: src/middleware/{NAME}.middleware.ts
Pattern:
  - Middleware function or class
  - For: auth, validation, error handling, logging
  
Example:
  File: src/middleware/auth.middleware.ts
  Function: authenticateJWT()
  
  File: src/middleware/validation.middleware.ts
  Function: validateRequest()
```

#### TESTS
```
Unit Tests:
  File: tests/unit/{FEATURE}.service.spec.ts
  File: tests/unit/{FEATURE}.repository.spec.ts
  
E2E Tests:
  File: tests/e2e/{FEATURE}.endpoint.e2e.spec.ts
  Covers: All HTTP endpoints and acceptance criteria
  
Example (SCRUM-6):
  File: tests/e2e/auth.login.e2e.spec.ts
  Tests: 3-5 scenarios covering acceptance criteria
```

---

## Spec Kit Generation Workflow

### Phase 1: /speckit.specify
```
Input: .github/specs/stories/SCRUM-6-auth-login.md
Output: Refined specification
Action: READ ONLY - don't modify spec file
```

### Phase 2: /speckit.plan
```
Creates implementation plan with these layers:
1. Models (User schema)
2. DTOs (LoginDTO, AuthResponseDTO)
3. Repository (UserRepository.findByEmail)
4. Service (AuthService.validateCredentials, generateToken)
5. Middleware (authenticateJWT)
6. Controller (AuthController.login)
7. Tests (Unit + E2E)
```

### Phase 3: /speckit.tasks
```
Breaks into atomic tasks:
- Task 1: Create User model in src/models/user.model.ts
- Task 2: Create LoginDTO in src/dtos/auth.dto.ts
- Task 3: Create UserRepository in src/repositories/user.repository.ts
- Task 4: Create AuthService in src/services/auth.service.ts
- Task 5: Create AuthController in src/controllers/auth.controller.ts
- Task 6: Create auth middleware in src/middleware/auth.middleware.ts
- Task 7: Write unit tests in tests/unit/auth.service.spec.ts
- Task 8: Write E2E tests in tests/e2e/auth.e2e.spec.ts
```

### Phase 4: /speckit.implement
```
Generates and places code:
✅ Creates src/models/user.model.ts
✅ Creates src/dtos/auth.dto.ts
✅ Creates src/repositories/user.repository.ts
✅ Creates src/services/auth.service.ts
✅ Creates src/controllers/auth.controller.ts
✅ Creates src/middleware/auth.middleware.ts
✅ Creates tests/unit/auth.service.spec.ts
✅ Creates tests/e2e/auth.e2e.spec.ts

THEN:
✅ Updates .github/specs/stories/SCRUM-6-auth-login.md
✅ Creates feature/SCRUM-6 branch
✅ Commits all changes
✅ Opens PR #XX (Draft)
✅ Updates .md with:
   - [x] checkboxes marked
   - Status: Code Complete
   - PR link
   - Test coverage %
```

---

## Acceptance Criteria Auto-Update

When each task completes:

```markdown
Before:
- [ ] Valida email y contraseña contra BD

After task "Create UserRepository.findByEmail":
- [x] Valida email y contraseña contra BD (Repository: a1b2c3)

After task "Create AuthService.validateCredentials":
- [x] Valida email y contraseña contra BD (Service: d4e5f6 | Repository: a1b2c3)

After all tasks + tests pass:
- [x] Valida email y contraseña contra BD (Complete | PR: #42 | Coverage: 98%)
```

---

## Checkpoint Updates

After each phase, update spec file:

### After Phase 3 (Tasks Complete):
```markdown
---
**📋 CHECKPOINT: Tasks Defined**

Tareas identificadas: 8
- Layer 1: Models (1 task)
- Layer 2: DTOs (1 task)
- Layer 3: Repository (1 task)
- Layer 4: Service (1 task)
- Layer 5: Middleware (1 task)
- Layer 6: Controller (1 task)
- Layer 7: Unit Tests (1 task)
- Layer 8: E2E Tests (1 task)

Status: Ready to implement
---
```

### After Phase 4 (Implementation):
```markdown
---
**✅ CHECKPOINT: Implementation Complete**

Code Generated:
- [x] Models: src/models/user.model.ts
- [x] DTOs: src/dtos/auth.dto.ts
- [x] Repository: src/repositories/user.repository.ts
- [x] Service: src/services/auth.service.ts
- [x] Controller: src/controllers/auth.controller.ts
- [x] Middleware: src/middleware/auth.middleware.ts
- [x] Unit Tests: tests/unit/auth.service.spec.ts (98% coverage)
- [x] E2E Tests: tests/e2e/auth.e2e.spec.ts (All 3 scenarios passing)

Branch: feature/SCRUM-6-auth-login
PR: #42 (Ready for Review)
Test Results: 8/8 passing
Coverage: 97%

Status: Code Review Phase
---
```

---

## Git Integration

When implementing:

```
Branch name: feature/SCRUM-{NUMBER}-{slug}
Example: feature/SCRUM-6-auth-login

Commit messages:
- "SCRUM-6: Create User model and schema"
- "SCRUM-6: Implement AuthService with JWT generation"
- "SCRUM-6: Add auth controller endpoints"
- "SCRUM-6: Write E2E tests for login flow"

Each commit updates the .md file with completion %.

PR Title: "SCRUM-6: Implement Auth Login Endpoint"
PR Description:
  - Links to .md spec
  - Lists all acceptance criteria (checked)
  - Test coverage %
```

---

## Testing Strategy

### Unit Tests (by layer):

```
tests/unit/auth.service.spec.ts:
  ✓ AuthService.validateCredentials() with valid password
  ✓ AuthService.validateCredentials() with invalid password
  ✓ AuthService.generateToken() returns valid JWT
  ✓ AuthService.hashPassword() returns bcrypt hash

tests/unit/user.repository.spec.ts:
  ✓ UserRepository.findByEmail() returns user if exists
  ✓ UserRepository.findByEmail() returns null if not exists
```

### E2E Tests (by acceptance criteria):

```
tests/e2e/auth.e2e.spec.ts:
  ✓ POST /auth/login with valid credentials returns 200 + token
  ✓ POST /auth/login with invalid password returns 401
  ✓ POST /auth/login with nonexistent user returns 401

All 3 scenarios from Gherkin map to E2E tests.
Each test verifies one AC.
```

---

## Final Checklist Before PR Merge

```
✅ Code generated in correct layers
✅ All acceptance criteria implemented
✅ All tests passing (unit + E2E)
✅ Test coverage >= 90%
✅ Code follows project conventions
✅ .md file updated with checkboxes and PR link
✅ No linting errors
✅ TypeScript compiles without errors
✅ Ready for code review
```

---

## Summary: Layer-Based Flow

```
Spec (.md) 
  ↓
Models (schema definition)
  ↓
DTOs (request/response contracts)
  ↓
Repository (data access)
  ↓
Service (business logic)
  ↓
Middleware (cross-cutting concerns)
  ↓
Controller (HTTP endpoints)
  ↓
Tests (unit + E2E validation)
  ↓
Branch + PR
  ↓
.md updated with progress
```

Each layer is **independent** and **testable**.
Spec Kit generates ALL layers automatically.
Tests verify the entire stack.
