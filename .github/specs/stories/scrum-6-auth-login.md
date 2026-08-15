# SCRUM-6: Implementar endpoint de login (POST /auth/login)

**Epic:** AUTH-EPIC  
**Priority:** Highest  
**Story Points:** 5  
**Status:** Ready for Implementation

## Description

Implementar implementar endpoint de login (post /auth/login)

## Acceptance Criteria

- [ ] Valida email y contraseña contra BD
- [ ] Retorna JWT con duración de 15 minutos
- [ ] Incluye refresh token con duración de 7 días
- [ ] Hash de contraseña con bcrypt
- [ ] Retorna 401 si credenciales inválidas
- [ ] Log de intentos fallidos

## Test Scenarios (Gherkin)

```gherkin
Scenario: Login exitoso
  Given un usuario con email 'user@example.com' existe
  When POST /auth/login con {email, password válido}
  Then retorna 200 con {accessToken, refreshToken, expiresIn}

Scenario: Password incorrecto
  Given un usuario con email 'user@example.com' existe
  When POST /auth/login con password incorrecto
  Then retorna 401 {error: 'Invalid credentials'}

Scenario: Usuario no existe
  Given no existe usuario con email 'nonexistent@example.com'
  When POST /auth/login con ese email
  Then retorna 401 {error: 'Invalid credentials'}
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
