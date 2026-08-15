# SCRUM-22: Implementar endpoint POST /api/products (crear producto)

**Epic:** PRODUCTS-EPIC  
**Priority:** High  
**Story Points:** 5  
**Status:** Ready for Implementation

## Description

Implementar implementar endpoint post /api/products (crear producto)

## Acceptance Criteria

- [ ] ADMIN y USER pueden crear productos
- [ ] Requiere JWT token válido
- [ ] Campos: name (required), description, price (required), stock (required)
- [ ] Valida que price > 0 y stock >= 0
- [ ] created_by se asigna automáticamente al usuario autenticado
- [ ] Retorna 400 si validación falla
- [ ] Retorna 409 si nombre duplicado
- [ ] Log de creación

## Test Scenarios (Gherkin)

```gherkin
Scenario: USER crea producto
  Given usuario USER autenticado
  When POST /api/products con {name, description, price, stock}
  Then retorna 201 con {id, name, price, stock, created_by, createdAt}

Scenario: Producto sin nombre
  Given usuario autenticado
  When POST /api/products sin 'name'
  Then retorna 400 {error: 'Name is required'}

Scenario: Price negativo
  Given usuario autenticado
  When POST /api/products con price: -100
  Then retorna 400 {error: 'Price must be greater than 0'}
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
