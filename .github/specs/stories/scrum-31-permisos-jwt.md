# SCRUM-31: Crear middleware de validación de JWT

**Epic:** PERMISOS-EPIC  
**Priority:** Highest  
**Story Points:** 4  
**Status:** Ready for Implementation

## Description

Implementar crear middleware de validación de jwt

## Acceptance Criteria

- [ ] Valida token en Authorization header
- [ ] Verifica firma del token
- [ ] Verifica expiración
- [ ] Retorna 401 si token inválido o expirado
- [ ] Retorna 401 si header no tiene token
- [ ] Extrae claims (user ID, role) y los pasa a siguiente middleware
- [ ] Maneja refresh token automáticamente

## Test Scenarios (Gherkin)

```gherkin
Scenario: JWT válido en header
  Given Authorization: Bearer {validToken}
  When request llega al middleware
  Then extrae user_id y role del token
  And pasa al siguiente middleware

Scenario: JWT expirado
  Given Authorization: Bearer {expiredToken}
  When request llega al middleware
  Then retorna 401 {error: 'Token expired'}

Scenario: Header sin Authorization
  Given request sin Authorization header
  When intenta acceder endpoint protegido
  Then retorna 401 {error: 'Authorization header missing'}
```

## Technical Context

- Stack: Node.js/Express + PostgreSQL
- Pattern: Repository + Service + Controller
- Auth: JWT validation required
- Validation: Zod or class-validator

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
