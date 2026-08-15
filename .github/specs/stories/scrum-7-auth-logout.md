# SCRUM-7: Implementar endpoint de logout (POST /auth/logout)

**Epic:** AUTH-EPIC  
**Priority:** Highest  
**Story Points:** 3  
**Status:** Ready for Implementation

## Description

Implementar implementar endpoint de logout (post /auth/logout)

## Clarifications

### Session 2026-08-15

- Q: Which revocation mechanism should the logout flow enforce for this story? → A: Database blacklist table

## Acceptance Criteria

- [ ] Recibe JWT token
- [ ] Invalida token en blacklist en tabla de tokens revocados en BD
- [ ] Retorna 200 si logout exitoso
- [ ] Token no puede ser usado después de logout
- [ ] Refresh token también es revocado

## Test Scenarios (Gherkin)

```gherkin
Scenario: Logout exitoso
  Given usuario con token válido
  When POST /auth/logout
  Then retorna 200 {message: 'Logged out successfully'}
  And token no puede ser reutilizado

Scenario: Token inválido
  Given token expirado o inválido
  When POST /auth/logout
  Then retorna 401 {error: 'Invalid token'}
```

## Technical Context

- Stack: Node.js/Express + PostgreSQL
- Pattern: Repository + Service + Controller
- Auth: JWT validation required
- Validation: Zod or class-validator
- Revocation: blacklist persisted in PostgreSQL table for invalidated access/refresh tokens

## Implementation Checklist

- [ ] Create/update models
- [ ] Implement service logic
- [ ] Create controller/route
- [ ] Add validation (DTO)
- [ ] Write unit tests
- [ ] Write E2E tests
- [ ] Update API documentation
- [ ] Add audit logging (if applicable)

---

*Generado automáticamente desde Spec Kit harness*
