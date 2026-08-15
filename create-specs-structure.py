#!/usr/bin/env python3
"""
Script para crear estructura de specs desde Jira CSV
Uso: python create-specs-structure.py /ruta/proyecto
"""

import os
import sys
from pathlib import Path

# Datos de las historias (de nuestro CSV)
EPICS = {
    "AUTH-EPIC": {
        "summary": "Autenticación y Autorización",
        "description": "Implementar sistema de autenticación con JWT, soportando login, logout, cambio de contraseña y estructura de roles (ADMIN, USER). Dejar arquitectura preparada para OAuth."
    },
    "USERS-EPIC": {
        "summary": "CRUD de Usuarios",
        "description": "Implementar operaciones CRUD completas para usuarios. Solo ADMIN puede actualizar/eliminar usuarios."
    },
    "PRODUCTS-EPIC": {
        "summary": "CRUD de Productos",
        "description": "Implementar operaciones CRUD para productos. ADMIN puede crear/actualizar/eliminar. USER puede crear y ver."
    },
    "PERMISOS-EPIC": {
        "summary": "Validación de Roles y Permisos",
        "description": "Implementar middleware y guardrails de autorización en todos los endpoints. Matriz de permisos clara."
    },
    "INFRA-EPIC": {
        "summary": "Arquitectura e Infraestructura",
        "description": "Setup de proyecto, BD, tests, documentación API."
    }
}

STORIES = [
    # AUTH STORIES
    {
        "key": "SCRUM-6",
        "external_key": "AUTH-LOGIN",
        "summary": "Implementar endpoint de login (POST /auth/login)",
        "epic": "AUTH-EPIC",
        "priority": "Highest",
        "points": 5,
        "acceptance": [
            "Valida email y contraseña contra BD",
            "Retorna JWT con duración de 15 minutos",
            "Incluye refresh token con duración de 7 días",
            "Hash de contraseña con bcrypt",
            "Retorna 401 si credenciales inválidas",
            "Log de intentos fallidos"
        ],
        "tests": """Scenario: Login exitoso
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
  Then retorna 401 {error: 'Invalid credentials'}"""
    },
    {
        "key": "SCRUM-7",
        "external_key": "AUTH-LOGOUT",
        "summary": "Implementar endpoint de logout (POST /auth/logout)",
        "epic": "AUTH-EPIC",
        "priority": "Highest",
        "points": 3,
        "acceptance": [
            "Recibe JWT token",
            "Invalida token en blacklist (Redis o BD)",
            "Retorna 200 si logout exitoso",
            "Token no puede ser usado después de logout",
            "Refresh token también es revocado"
        ],
        "tests": """Scenario: Logout exitoso
  Given usuario con token válido
  When POST /auth/logout
  Then retorna 200 {message: 'Logged out successfully'}
  And token no puede ser reutilizado

Scenario: Token inválido
  Given token expirado o inválido
  When POST /auth/logout
  Then retorna 401 {error: 'Invalid token'}"""
    },
    {
        "key": "SCRUM-8",
        "external_key": "AUTH-CHANGE-PWD",
        "summary": "Implementar endpoint de cambio de contraseña (POST /auth/change-password)",
        "epic": "AUTH-EPIC",
        "priority": "High",
        "points": 5,
        "acceptance": [
            "Requiere JWT token válido",
            "Valida contraseña actual (match con hash en BD)",
            "Nueva contraseña debe ser diferente a la actual",
            "Nueva contraseña mínimo 8 caracteres",
            "Hash nueva contraseña con bcrypt",
            "Invalida todos los tokens activos después del cambio",
            "Log de auditoría del cambio"
        ],
        "tests": """Scenario: Cambio de contraseña exitoso
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
  Then retorna 400 {error: 'Password must be at least 8 characters'}"""
    },
    {
        "key": "SCRUM-9",
        "external_key": "AUTH-ROLES",
        "summary": "Implementar estructura de roles y permisos (ADMIN, USER)",
        "epic": "AUTH-EPIC",
        "priority": "Highest",
        "points": 8,
        "acceptance": [
            "Tabla users tiene campo 'role' (ENUM: ADMIN, USER)",
            "Roles guardados en JWT token",
            "Middleware de validación de roles",
            "Arquitectura permite agregar más roles sin cambios de BD",
            "Interface abstracta para futuros providers (JWT, OAuth)",
            "Documentación de matriz de permisos"
        ],
        "tests": """Scenario: ADMIN puede acceder a endpoints administrativos
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
  Then token contiene claim 'role' con valor 'USER' o 'ADMIN'"""
    },
    # PERMISSIONS STORIES
    {
        "key": "SCRUM-31",
        "external_key": "PERMISOS-JWT",
        "summary": "Crear middleware de validación de JWT",
        "epic": "PERMISOS-EPIC",
        "priority": "Highest",
        "points": 4,
        "acceptance": [
            "Valida token en Authorization header",
            "Verifica firma del token",
            "Verifica expiración",
            "Retorna 401 si token inválido o expirado",
            "Retorna 401 si header no tiene token",
            "Extrae claims (user ID, role) y los pasa a siguiente middleware",
            "Maneja refresh token automáticamente"
        ],
        "tests": """Scenario: JWT válido en header
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
  Then retorna 401 {error: 'Authorization header missing'}"""
    },
    {
        "key": "SCRUM-32",
        "external_key": "PERMISOS-ROLES",
        "summary": "Crear middleware de validación de roles",
        "epic": "PERMISOS-EPIC",
        "priority": "High",
        "points": 5,
        "acceptance": [
            "Decorator/middleware configurable por ruta",
            "Valida que usuario tiene rol requerido",
            "Retorna 403 si role insuficiente",
            "Soporta múltiples roles por endpoint (OR logic)",
            "Soporta custom permission checks",
            "Log de intentos fallidos"
        ],
        "tests": """Scenario: USER intenta acceder endpoint ADMIN-only
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
  Then middleware permite acceso"""
    },
    {
        "key": "SCRUM-33",
        "external_key": "PERMISOS-DOCS",
        "summary": "Documentar matriz de permisos",
        "epic": "PERMISOS-EPIC",
        "priority": "Medium",
        "points": 2,
        "acceptance": [
            "Tabla de endpoints vs roles",
            "Descripción de cada permiso",
            "Incluida en README y documentación API",
            "OpenAPI spec refleja permisos",
            "Actualizada cuando se agregan endpoints"
        ],
        "tests": """Scenario: Matriz de permisos documentada
  Given README.md o PERMISSIONS.md existe
  When lee la documentación
  Then ve tabla clara con:
    - Endpoint (POST /auth/login, GET /api/users, etc)
    - Rol permitido (ADMIN, USER, PUBLIC)
    - Descripción de qué hace"""
    }
]

def create_spec_file(content: str, filepath: Path):
    """Crea archivo de spec"""
    filepath.parent.mkdir(parents=True, exist_ok=True)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"✅ Creado: {filepath}")

def generate_epic_spec(key: str, epic: dict) -> str:
    """Genera contenido markdown para epic"""
    return f"""# {key}: {epic['summary']}

**Type:** Epic  
**Status:** Backlog

## Description

{epic['description']}

## Acceptance Criteria

- [ ] Implementado y testeado
- [ ] Code review aprobado
- [ ] Integrado en main

---

*Generado automáticamente desde Spec Kit harness*
"""

def generate_story_spec(story: dict) -> str:
    """Genera contenido markdown para story"""
    acceptance_list = '\n'.join([f"- [ ] {ac}" for ac in story['acceptance']])
    
    return f"""# {story['key']}: {story['summary']}

**Epic:** {story['epic']}  
**Priority:** {story['priority']}  
**Story Points:** {story['points']}  
**Status:** Ready for Implementation

## Description

Implementar {story['summary'].lower()}

## Acceptance Criteria

{acceptance_list}

## Test Scenarios (Gherkin)

```gherkin
{story['tests']}
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
"""

def main():
    if len(sys.argv) < 2:
        print("Uso: python create-specs-structure.py /ruta/proyecto")
        sys.exit(1)
    
    project_root = Path(sys.argv[1])
    specs_dir = project_root / ".github" / "specs"
    
    print(f"📁 Creando estructura de specs en: {specs_dir}")
    
    # Crear carpetas
    (specs_dir / "epics").mkdir(parents=True, exist_ok=True)
    (specs_dir / "stories").mkdir(parents=True, exist_ok=True)
    
    # Crear specs de epics
    print("\n📋 Creando Epics:")
    for key, epic in EPICS.items():
        filename = key.lower().replace("-", "_") + ".md"
        filepath = specs_dir / "epics" / filename
        content = generate_epic_spec(key, epic)
        create_spec_file(content, filepath)
    
    # Crear specs de stories
    print("\n📋 Creando Stories:")
    for story in STORIES:
        filename = f"{story['key'].lower()}-{story['external_key'].lower()}.md"
        filepath = specs_dir / "stories" / filename
        content = generate_story_spec(story)
        create_spec_file(content, filepath)
    
    print(f"\n✅ Harness creado exitosamente en: {specs_dir}")
    print(f"\nProximos pasos:")
    print(f"1. cd {project_root}")
    print(f"2. specify init .")
    print(f"3. /speckit.specify {specs_dir}/stories/SCRUM-6-*.md")
    print(f"4. /speckit.plan")
    print(f"5. /speckit.tasks")

if __name__ == "__main__":
    main()
