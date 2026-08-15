# SCRUM-32: Crear middleware de validación de roles

**Epic:** PERMISOS-EPIC  
**Priority:** High  
**Story Points:** 5  
**Status:** Ready for Implementation

## Description

Implementar crear middleware de validación de roles

## Acceptance Criteria

- [ ] Decorator/middleware configurable por ruta
- [ ] Valida que usuario tiene rol requerido
- [ ] Retorna 403 si role insuficiente
- [ ] Soporta múltiples roles por endpoint (OR logic)
- [ ] Soporta custom permission checks
- [ ] Log de intentos fallidos

## Test Scenarios (Gherkin)

```gherkin
Scenario: USER intenta acceder endpoint ADMIN-only
  Given usuario con role USER
  When intenta POST /api/users
  Then retorna 403 {error: 'Insufficient permissions'}
  And log registra intento fallido

Scenario: ADMIN accede endpoint ADMIN-only
  Given usuario con role ADMIN
  When intenta POST /api/users
  Then middleware permite acceso
  And request continúa al controlador

Scenario: Endpoint permite múltiples roles
  Given endpoint configurado para roles [ADMIN, SUPERUSER]
  When usuario con rol SUPERUSER intenta acceder
  Then middleware permite acceso
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
