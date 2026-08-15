# SCRUM-8: Implementar endpoint de cambio de contraseña (POST /auth/change-password)

**Epic:** AUTH-EPIC  
**Priority:** High  
**Story Points:** 5  
**Status:** Ready for Implementation

## Description

Implementar implementar endpoint de cambio de contraseña (post /auth/change-password)

## Acceptance Criteria

- [ ] Requiere JWT token válido
- [ ] Valida contraseña actual (match con hash en BD)
- [ ] Nueva contraseña debe ser diferente a la actual
- [ ] Nueva contraseña mínimo 8 caracteres
- [ ] Hash nueva contraseña con bcrypt
- [ ] Invalida todos los tokens activos después del cambio
- [ ] Log de auditoría del cambio

## Test Scenarios (Gherkin)

```gherkin
Scenario: Cambio de contraseña exitoso
  Given usuario autenticado con token válido
  When POST /auth/change-password con {currentPassword, newPassword}
  Then retorna 200 {message: 'Password changed'}
  And token actual es invalidado

Scenario: Contraseña actual incorrecta
  Given usuario autenticado
  When POST /auth/change-password con currentPassword incorrecto
  Then retorna 401 {error: 'Current password incorrect'}

Scenario: Nueva contraseña muy corta
  Given usuario autenticado
  When POST /auth/change-password con newPassword de 5 caracteres
  Then retorna 400 {error: 'Password must be at least 8 characters'}
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
