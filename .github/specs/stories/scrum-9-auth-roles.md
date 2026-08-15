# SCRUM-9: Implementar estructura de roles y permisos (ADMIN, USER)

**Epic:** AUTH-EPIC  
**Priority:** Highest  
**Story Points:** 8  
**Status:** Ready for Implementation

## Description

Implementar implementar estructura de roles y permisos (admin, user)

## Acceptance Criteria

- [ ] Tabla users tiene campo 'role' (ENUM: ADMIN, USER)
- [ ] Roles guardados en JWT token
- [ ] Middleware de validación de roles
- [ ] Arquitectura permite agregar más roles sin cambios de BD
- [ ] Interface abstracta para futuros providers (JWT, OAuth)
- [ ] Documentación de matriz de permisos

## Test Scenarios (Gherkin)

```gherkin
Scenario: ADMIN puede acceder a endpoints administrativos
  Given usuario con role ADMIN
  When intenta DELETE /api/users/:id
  Then se ejecuta exitosamente

Scenario: USER no puede acceder a endpoints administrativos
  Given usuario con role USER
  When intenta DELETE /api/users/:id
  Then retorna 403 {error: 'Insufficient permissions'}

Scenario: Role está en JWT token
  Given usuario autenticado
  When decodifica accessToken
  Then token contiene claim 'role' con valor 'USER' o 'ADMIN'
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
