# SCRUM-33: Documentar matriz de permisos

**Epic:** PERMISOS-EPIC  
**Priority:** Medium  
**Story Points:** 2  
**Status:** Ready for Implementation

## Description

Implementar documentar matriz de permisos

## Acceptance Criteria

- [ ] Tabla de endpoints vs roles
- [ ] Descripción de cada permiso
- [ ] Incluida en README y documentación API
- [ ] OpenAPI spec refleja permisos
- [ ] Actualizada cuando se agregan endpoints

## Test Scenarios (Gherkin)

```gherkin
Scenario: Matriz de permisos documentada
  Given README.md o PERMISSIONS.md existe
  When lee la documentación
  Then ve tabla clara con:
    - Endpoint (POST /auth/login, GET /api/users, etc)
    - Rol permitido (ADMIN, USER, PUBLIC)
    - Descripción de qué hace
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
