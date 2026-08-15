# Constitution: User & Product Management System

**Version:** 1.0  
**Last Updated:** 2026-08-15  
**Status:** Immutable (changes require team consensus)

---

## Purpose

This document defines the immutable architectural principles, technology decisions, and core values that govern the **User & Product Management System** project. All code, features, and architectural decisions must align with this constitution.

The constitution is the **source of truth** for what we build and how we build it. It transcends individual stories or sprints—it defines the DNA of the project.

---

## Part 1: Architectural Principles

### 1.1 Layered Architecture (Mandatory)

All code must follow this strict layering:

```
User Request
    ↓
Controller (HTTP endpoint validation)
    ↓
Middleware (Auth, CORS, logging)
    ↓
Service (Business logic)
    ↓
Repository (Data access)
    ↓
Model (Database schema)
    ↓
Database (PostgreSQL)
```

**Rules:**
- Controllers NEVER call Repositories directly (must go through Service)
- Repositories NEVER contain business logic
- Services NEVER handle HTTP details
- Each layer has ONE responsibility only
- No layer-skipping allowed

**Example (SCRUM-6 Auth Login):**
```
✅ CORRECT:
  Controller.login() 
    → calls AuthService.validateCredentials()
    → calls UserRepository.findByEmail()
    → accesses User model

❌ WRONG:
  Controller.login()
    → directly calls UserRepository
    → directly accesses database
```

---

### 1.2 Specification-Driven Development (SDD)

```
Spec First → Plan → Code → Test → Deploy
```

**Non-negotiable:**
- Write spec BEFORE code (`.github/specs/stories/SCRUM-X.md`)
- Spec defines acceptance criteria
- Code implements spec (not spec follows code)
- Always create a new branch for each spec/feature to implement.
- Tests validate spec compliance
- Never code without a spec

**Tools:**
- Spec Kit orchestrates the flow
- AGENTS.md provides technical guidance
- This constitution defines principles

---

### 1.3 Type Safety First

**TypeScript strict mode ALWAYS:**

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true
  }
}
```

**Rules:**
- No `any` type anywhere (except in exceptional cases, with comment explaining)
- All function parameters must be typed
- All function returns must be typed
- Use interfaces for all major structures
- Use discriminated unions for complex types

---

### 1.4 Security by Default

Security is NOT a feature—it's a requirement baked into every layer.

#### Authentication
- **Only JWT** (no sessions, no bearer-only)
- Access token expiry: **15 minutes** (non-negotiable)
- Refresh token expiry: **7 days**
- Refresh tokens stored in HTTP-only cookies
- Token rotation on every refresh

#### Password Management
- **Hash with bcrypt** (10 rounds minimum)
- Never store plaintext passwords
- Never log passwords (even hashed)
- Minimum 8 characters enforced by validation

#### Database Security
- **Parameterized queries ALWAYS** (no string concatenation)
- ORM query builders prevent SQL injection
- Foreign key constraints enforced
- Row-level security for sensitive data

#### API Security
- **CORS configured per environment** (whitelist, never wildcard)
- **HTTPS enforced** in production
- **Rate limiting** on auth endpoints (5 attempts / 15 minutes)
- **Input validation** on all endpoints (Zod/class-validator)
- **Output sanitization** (never return passwords, tokens, secrets)

#### Audit Trail
- **All sensitive actions logged:**
  - Login/Logout
  - Password changes
  - User/Product creation/modification/deletion
  - Failed auth attempts
- Logs include: timestamp, user_id, action, resource, outcome
- Logs NEVER contain passwords or tokens

---

### 1.5 Testing is Documentation

```
Code without tests is code you don't understand yet.
```

**Mandatory minimums:**
- **Unit test coverage: 90%** (services, repositories)
- **E2E test coverage: 100% of acceptance criteria**
- **All acceptance criteria must map to at least one test**

**Test Structure:**
```
tests/
├── unit/
│   ├── {feature}.service.spec.ts
│   └── {feature}.repository.spec.ts
└── e2e/
    └── {feature}.endpoint.e2e.spec.ts
```

**Test naming:**
```typescript
describe('AuthService', () => {
  describe('validateCredentials', () => {
    it('should return user if email and password are valid', () => {
      // Gherkin-style test name matching acceptance criteria
    });
    
    it('should throw UnauthorizedException if password is invalid', () => {
      // Tests error path
    });
  });
});
```

**E2E tests map to Gherkin:**
```gherkin
Scenario: Login with valid credentials
  Given a user with email 'test@example.com' exists
  When POST /auth/login with valid password
  Then returns 200 with accessToken
```

Maps to:
```typescript
it('should return 200 with accessToken when credentials are valid', async () => {
  // E2E test implementation
});
```

---

### 1.6 Fail Explicitly, Not Silently

**Error Handling Rules:**
- No swallowing exceptions
- All errors logged with context
- Client receives clear error messages (not stack traces)
- HTTP status codes follow RFC standards:
  - 400: Bad Request (validation failed)
  - 401: Unauthorized (auth failed)
  - 403: Forbidden (auth passed but insufficient permissions)
  - 404: Not Found
  - 409: Conflict (duplicate resource)
  - 500: Server Error (unexpected)

**Example:**
```typescript
// ❌ WRONG: Silent failure
if (!user) return null;

// ✅ CORRECT: Explicit error
if (!user) {
  logger.warn(`User not found: ${email}`);
  throw new NotFoundException(`User with email ${email} not found`);
}
```

---

## Part 2: Technology Stack (IMMUTABLE)

These decisions are **final** and change only with unanimous team consensus.

### Backend
| Component | Technology | Version | Why |
|-----------|-----------|---------|-----|
| Runtime | Node.js | 18+ | Native async/await, TypeScript support |
| Framework | Express or NestJS | Latest | Lightweight (Express) or opinionated structure (NestJS) |
| Language | TypeScript | 5.0+ | Type safety, better DX, fewer bugs |
| Database | PostgreSQL | 13+ | ACID compliance, jsonb support, strong typing |
| ORM | TypeORM or Prisma | Latest | Type-safe queries, migrations, schema inference |
| Auth | JWT | - | Stateless, scalable, no session storage |
| Hashing | bcrypt | - | Industry standard for password hashing |
| Validation | Zod or class-validator | Latest | Schema validation, type inference |
| Testing | Jest or Vitest | Latest | Fast, rich ecosystem, snapshot testing |
| Logging | Winston or Pino | Latest | Structured logging, levels, transports |
| Caching | Redis | 6+ | Fast in-memory cache, token blacklist |

### API Documentation
- **OpenAPI 3.0** (Swagger UI)
- Endpoints documented BEFORE implementation
- Examples in spec for every endpoint
- Status codes documented

### DevOps & CI/CD
- **Git branching:** Git Flow (feature/*, release/*, hotfix/*)
- **Repository:** GitHub
- **CI/CD:** GitHub Actions
- **Docker:** Containerized deployment
- **Deployment:** Environment-specific (dev, staging, prod)

---

## Part 3: Code Quality Standards

### 3.1 Linting & Formatting

**ESLint Configuration:**
```javascript
// .eslintrc.js
module.exports = {
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  rules: {
    'no-console': 'error',          // Use logger instead
    'no-var': 'error',              // Use let/const
    '@typescript-eslint/explicit-function-return-types': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
  }
};
```

**Prettier Configuration:**
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

**Pre-commit hooks:**
- Run linting on staged files
- Run tests on changed files
- Format on commit (auto-fix)

---

### 3.2 Code Review Checklist

Every PR must pass:

```markdown
- [ ] Spec exists in .github/specs/stories/
- [ ] Code matches spec (all acceptance criteria implemented)
- [ ] Tests pass locally (unit + E2E)
- [ ] Test coverage >= 90%
- [ ] No console.log (use logger)
- [ ] No hardcoded secrets
- [ ] TypeScript compiles without errors
- [ ] ESLint passes
- [ ] Function documentation (JSDoc)
- [ ] Database migrations versioned
- [ ] API documentation updated
- [ ] Jira issue linked in PR
- [ ] Spec .md file updated with PR link and checkboxes
```

---

### 3.3 Documentation Requirements

**Every feature must have:**
1. Spec in `.github/specs/stories/SCRUM-X.md`
2. Acceptance criteria (checklist)
3. Test scenarios (Gherkin format)
4. API endpoint documented in OpenAPI
5. Code comments for complex logic
6. JSDoc on public functions
7. Commit message referencing SCRUM-X

---

## Part 4: Release & Deployment

### 4.1 Versioning

- **Semantic Versioning:** MAJOR.MINOR.PATCH
- **Major:** Breaking API changes
- **Minor:** New features (backward compatible)
- **Patch:** Bug fixes

Example:
- v1.0.0 → Initial release
- v1.1.0 → New feature (GET /products with filters)
- v1.1.1 → Bug fix (Auth token expiry off by 1 second)

### 4.2 Release Process

```
1. Feature branch: feature/SCRUM-X
2. Code review & approval
3. Merge to main
4. Tag release: v1.X.X
5. GitHub Actions builds & pushes Docker image
6. Deploy to staging environment
7. Smoke tests pass
8. Deploy to production
9. Monitor logs for errors
```

### 4.3 Rollback Strategy

- All deployments are **reversible**
- Keep previous Docker image available (tagged with version)
- Database migrations are **forward & backward compatible**
- Feature flags for risky changes

---

## Part 5: Project Values

### 5.1 Clarity Over Cleverness

```typescript
// ❌ Clever but confusing
const result = users.filter(u => u.role & ADMIN).map(u => u.id);

// ✅ Clear and maintainable
const adminUsers = users.filter(u => u.role === 'ADMIN');
const adminIds = adminUsers.map(u => u.id);
```

### 5.2 Spec Before Code

No exceptions. A story without a spec is a blocker.

### 5.3 Tests Before Features

Write tests (or at least test scenarios) before implementing.

### 5.4 Fail Loudly, Learn Fast

- Errors are expected and logged
- We learn from each failure
- Post-mortems are blameless
- Improvements documented

### 5.5 Security is Everyone's Job

- Every developer is responsible for security
- Security review in code review
- No "we'll fix it later"
- Vulnerabilities are emergencies

---

## Part 6: Relationship to AGENTS.md & Spec Kit

**Constitution.md defines WHAT and WHY.**  
**AGENTS.md defines HOW.**  
**Spec Kit orchestrates.**

```
Constitution (Immutable Principles):
  "We use layered architecture"
  "We use JWT for auth"
  "We require 90% test coverage"

AGENTS.md (Tactical Instructions):
  "Controllers go in src/controllers/"
  "Services go in src/services/"
  "Update checkboxes after each task"

Spec Kit (Orchestrator):
  Reads Constitution → Respects principles
  Reads AGENTS.md → Knows where to place code
  Reads Spec → Knows what to build
  Generates code that respects all three
```

---

## Part 7: Changing the Constitution

**This document is immutable by design.** Changes require:

1. **Written proposal** (issue in GitHub)
2. **Team discussion** (all developers)
3. **Unanimous consent** (no exceptions)
4. **Documentation** (update this file + CHANGELOG.md)
5. **Retroactive fixes** (update existing code to match new principle)

**Example:**
```markdown
Issue: "Switch from JWT to OAuth2 for enterprise customers"

Discussion:
- Current: JWT stateless
- Proposed: OAuth2 for enterprise, JWT for standard
- Impact: Affects all auth code, tests, documentation
- Effort: High

Decision: Team votes. Unanimous approval required.
If approved: Update constitution, update all code, update specs.
```

---

## Part 8: Anti-Patterns (What We Never Do)

❌ **No SQL string concatenation** (always parameterized)  
❌ **No logging passwords or tokens** (ever)  
❌ **No code without tests**  
❌ **No specs written after code**  
❌ **No direct DB access from controllers**  
❌ **No hardcoded secrets** (env vars always)  
❌ **No skipping code review**  
❌ **No disabling TypeScript strict mode**  
❌ **No "we'll fix it later"** on security  
❌ **No sharing database connections** between requests  

---

## Part 9: Success Metrics

By the end of each sprint, we measure:

- ✅ **Spec compliance:** 100% of acceptance criteria implemented
- ✅ **Test coverage:** >= 90% (unit + E2E)
- ✅ **Code review:** 100% of PRs reviewed by 2+ devs
- ✅ **Security:** 0 known vulnerabilities
- ✅ **Performance:** API response time < 200ms (p95)
- ✅ **Reliability:** 99.5% uptime
- ✅ **Documentation:** All endpoints documented
- ✅ **Quality:** ESLint + TypeScript passing

---

## Conclusion

This constitution is the **contract** between us as developers and the codebase. It ensures:

- **Consistency:** Every feature built the same way
- **Quality:** High standards, no shortcuts
- **Security:** Built-in from the start
- **Maintainability:** Future developers understand why things are this way
- **Scalability:** Architecture supports growth without major refactors

**When you code, you're upholding this constitution.**

---

**Version History:**
- v1.0 (2026-08-15): Initial constitution for User & Product Management System

