# Testing Strategy - Provcontrol

## Overview

Este documento describe la estrategia de testing automatizado para Provcontrol, diseñada para maximizar el uso de agentes de Cursor 2.0 y preparar el terreno para integración MCP cuando sea necesario.

## Filosofía de Testing

### Enfoque Híbrido

1. **Agentes de Cursor 2.0 (Principal)**: Usar agentes en segundo plano para ejecutar tests durante desarrollo
2. **MCP (Futuro)**: Configurar MCP completo solo cuando sea necesario para tests complejos o CI/CD

### Principios

- **Tests rápidos primero**: Smoke tests que verifican que nada se rompió
- **Tests incrementales**: Agregar tests para nuevas funcionalidades
- **Helpers reutilizables**: Funciones que simplifican escribir tests
- **Documentación clara**: Tests deben ser legibles y auto-documentados

## Configuración

### Instalación

Playwright ya está instalado y configurado. Los navegadores están instalados en:
- Chromium
- Firefox
- WebKit (Safari)

### Archivos de Configuración

- `playwright.config.ts` - Configuración principal de Playwright
- `.cursor/commands.json` - Comandos personalizados para Cursor
- `package.json` - Scripts npm para ejecutar tests

## Scripts Disponibles

### Ejecución Básica

```bash
# Ejecutar todos los tests (headless)
npm test

# Ejecutar con UI interactiva (recomendado para desarrollo)
npm run test:ui

# Ejecutar viendo el navegador (útil para debugging)
npm run test:headed

# Modo debug paso a paso
npm run test:debug
```

### Ejecución por Categoría

```bash
# Solo tests de autenticación
npm run test:auth

# Solo tests de onboarding
npm run test:onboarding

# Solo smoke tests (rápidos)
npm run test:smoke
```

### Reportes

```bash
# Ver reporte HTML de última ejecución
npm run test:report
```

## Comandos de Cursor 2.0

Los agentes de Cursor 2.0 pueden usar estos comandos personalizados:

- `/test:all` - Ejecutar todos los tests
- `/test:ui` - Ejecutar con UI interactiva
- `/test:headed` - Ver navegador durante ejecución
- `/test:auth` - Solo tests de autenticación
- `/test:onboarding` - Solo tests de onboarding
- `/test:smoke` - Tests básicos rápidos
- `/test:debug` - Modo debug
- `/test:report` - Ver reporte HTML

## Estructura de Tests

```
tests/
├── e2e/                    # Tests end-to-end
│   ├── smoke.spec.ts       # Tests básicos de verificación
│   ├── auth/               # Tests de autenticación
│   │   ├── login.spec.ts
│   │   └── register.spec.ts
│   ├── onboarding/         # Tests de onboarding
│   │   ├── create-community.spec.ts
│   │   └── register-provider.spec.ts
│   ├── incidents/          # Tests de incidencias
│   └── providers/          # Tests de proveedores
└── fixtures/               # Helpers y utilidades
    ├── auth.ts            # Helpers de autenticación
    ├── ui.ts              # Helpers de UI
    └── data.ts            # Helpers de datos
```

## Helpers Disponibles

### Autenticación (`tests/fixtures/auth.ts`)

```typescript
import { loginAs, loginWithCredentials, isAuthenticated, logout } from '../fixtures/auth';

// Login rápido como tipo de usuario
await loginAs(page, 'presidente');

// Login con credenciales personalizadas
await loginWithCredentials(page, 'user@test.com', 'password');

// Verificar autenticación
const authenticated = await isAuthenticated(page);

// Logout
await logout(page);
```

### UI (`tests/fixtures/ui.ts`)

```typescript
import { navigateTo, fillForm, waitForElement, clickButtonByText } from '../fixtures/ui';

// Navegar a una ruta
await navigateTo(page, '/dashboard');

// Llenar formulario
await fillForm(page, {
  'input[type="email"]': 'test@test.com',
  'input[type="password"]': 'password',
});

// Esperar elemento
await waitForElement(page, '[data-testid="submit-button"]');

// Click en botón por texto
await clickButtonByText(page, 'Guardar');
```

### Datos (`tests/fixtures/data.ts`)

```typescript
import { createTestUser, generateTestUserData } from '../fixtures/data';

// Generar datos de prueba
const userData = generateTestUserData('presidente');

// Crear usuario vía API
const user = await createTestUser(request, userData);
```

## Tests Existentes

### Smoke Tests (`tests/e2e/smoke.spec.ts`)

Tests básicos que verifican que la aplicación carga correctamente:
- Landing page carga
- Login page carga
- Registro page carga
- Navegación básica funciona
- No hay errores 404 en recursos estáticos

**Uso**: Ejecutar después de cambios para verificar que nada se rompió.

### Tests de Autenticación

#### Login (`tests/e2e/auth/login.spec.ts`)
- Login con credenciales válidas
- Login con credenciales inválidas
- Validación de campos requeridos
- Redirección según onboarding status

#### Registro (`tests/e2e/auth/register.spec.ts`)
- Registro de proveedor funciona
- Validación de contraseña mínima
- Validación de contraseñas coinciden

### Tests de Onboarding

#### Crear Comunidad (`tests/e2e/onboarding/create-community.spec.ts`)
- Wizard completo de 5 pasos
- Validación de campos en cada paso
- Progreso del wizard

#### Registro de Proveedor (`tests/e2e/onboarding/register-provider.spec.ts`)
- Registro redirige a creación de perfil
- Formulario de perfil carga correctamente

## Escribir Nuevos Tests

### Estructura Básica

```typescript
import { test, expect } from '@playwright/test';
import { navigateTo, waitForElement } from '../fixtures/ui';
import { loginAs } from '../fixtures/auth';

test.describe('Mi Nueva Funcionalidad', () => {
  test('debe hacer algo específico', async ({ page }) => {
    // Setup
    await navigateTo(page, '/ruta');
    
    // Acción
    await page.click('button');
    
    // Verificación
    await expect(page.locator('.resultado')).toBeVisible();
  });
});
```

### Best Practices

1. **Usar helpers**: Siempre usar helpers de `fixtures/` en lugar de código repetitivo
2. **Selectores robustos**: Preferir `data-testid` sobre selectores CSS frágiles
3. **Esperas explícitas**: Usar `waitForElement` en lugar de `waitForTimeout`
4. **Tests independientes**: Cada test debe poder ejecutarse solo
5. **Limpieza**: Limpiar datos de prueba después de cada test si es necesario

### Ejemplo Completo

```typescript
import { test, expect } from '@playwright/test';
import { navigateTo, fillForm, waitForToast } from '../fixtures/ui';
import { loginAs } from '../fixtures/auth';

test.describe('Crear Incidencia', () => {
  test.beforeEach(async ({ page }) => {
    // Login antes de cada test
    await loginAs(page, 'propietario');
    await navigateTo(page, '/incidencias');
  });

  test('debe crear una incidencia nueva', async ({ page }) => {
    // Click en "Nueva Incidencia"
    await page.click('button:has-text("Nueva Incidencia")');
    
    // Llenar formulario
    await fillForm(page, {
      'input[name="title"]': 'Fuga de agua',
      'textarea[name="description"]': 'Hay una fuga en el baño',
    });
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Verificar toast de éxito
    await waitForToast(page, 'Incidencia creada');
    
    // Verificar que la incidencia aparece en la lista
    await expect(page.locator('text=Fuga de agua')).toBeVisible();
  });
});
```

## Usar Agentes de Cursor 2.0

### Activación

1. **Agentes en segundo plano**: `Ctrl+E` o desde la barra lateral
2. **Comandos personalizados**: Escribir `/test:smoke` en el chat

### Flujo Recomendado

1. Hacer cambios en el código
2. Activar agente en segundo plano
3. Pedirle que ejecute `/test:smoke` para verificar que nada se rompió
4. Si hay fallos, el agente puede ver los screenshots/videos y ayudar a debuggear

### Ejemplo de Uso con Agente

```
Tú: "Ejecuta los smoke tests para verificar que la aplicación funciona"
Agente: [Ejecuta npm run test:smoke]
Agente: "Todos los smoke tests pasaron ✅"
```

## Preparación para MCP

### Cuándo Activar MCP

MCP debería activarse cuando:
- Tests complejos requieren múltiples navegadores simultáneos
- Necesitas ejecutar tests en CI/CD de forma automatizada
- Tests requieren capturas de video/screenshots automáticos en cada ejecución
- Necesitas integración con herramientas externas

### Configuración Futura de MCP

Cuando sea necesario, los pasos serían:

1. **Instalar MCP Server de Playwright** (cuando esté disponible)
2. **Configurar en Cursor Settings**:
   ```json
   {
     "mcpServers": {
       "playwright": {
         "command": "npx",
         "args": ["@playwright/mcp-server"],
         "env": {
           "PLAYWRIGHT_BASE_URL": "http://localhost:3000"
         }
       }
     }
   }
   ```
3. **Migrar tests críticos** a ejecución MCP
4. **Mantener tests básicos** ejecutables por agentes

### Tests Preparados para MCP

Los tests están escritos de forma que funcionarán tanto con agentes de Cursor como con MCP:
- Helpers modulares
- Configuración centralizada
- Sin dependencias de ejecución específica

## Troubleshooting

### Tests Fallan Intermitentemente

- **Solución**: Aumentar timeouts en `playwright.config.ts`
- **Solución**: Usar `waitForLoadState('networkidle')` antes de assertions

### No Encuentra Elementos

- **Verificar**: Que el servidor está corriendo (`npm run dev`)
- **Verificar**: Que la base URL es correcta en `playwright.config.ts`
- **Solución**: Usar `data-testid` en lugar de selectores CSS complejos

### Tests Son Muy Lentos

- **Solución**: Ejecutar tests en paralelo (ya configurado)
- **Solución**: Usar `test.only()` para ejecutar solo un test durante desarrollo
- **Solución**: Ejecutar solo categorías específicas (`npm run test:auth`)

### Screenshots/Videos No Se Generan

- **Verificar**: Configuración en `playwright.config.ts` (screenshots solo en fallos)
- **Solución**: Ejecutar con `--headed` para ver qué pasa
- **Solución**: Revisar carpeta `test-results/` después de ejecución

## Integración con CI/CD

### GitHub Actions (Ejemplo)

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npx playwright install --with-deps
      - run: npm run test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Métricas y Reportes

### Reporte HTML

Después de ejecutar tests, se genera un reporte HTML en `playwright-report/`:
- Ver con: `npm run test:report`
- Incluye: Screenshots, videos, traces, timeline

### Métricas Importantes

- **Tiempo de ejecución**: Monitorear que no aumente demasiado
- **Tasa de éxito**: Debe ser >95% en desarrollo
- **Tests por categoría**: Balancear coverage

## Próximos Pasos

### Tests a Agregar

1. **Tests de Incidencias**:
   - Crear incidencia
   - Subir fotos
   - Cambiar estado
   - Asignar proveedor

2. **Tests de Proveedores**:
   - Ver perfil
   - Ver ratings
   - Crear rating

3. **Tests de Dashboard**:
   - Carga correcta según rol
   - Navegación funciona
   - Datos se muestran correctamente

4. **Tests de Invitaciones**:
   - Crear invitación
   - Aceptar invitación
   - Validar códigos

### Mejoras Futuras

1. **Base de datos de prueba**: Configurar DB separada para tests
2. **Fixtures de Playwright**: Usar fixtures nativas para setup/teardown
3. **Visual regression**: Agregar tests de comparación visual
4. **Performance tests**: Medir tiempos de carga

## Referencias

- [Playwright Documentation](https://playwright.dev)
- [Cursor 2.0 Agents](https://docs.cursor.com/es/background-agent)
- [MCP Protocol](https://modelcontextprotocol.io)

---

**Última actualización**: 2025-01-XX
**Mantenido por**: Equipo de desarrollo Provcontrol

