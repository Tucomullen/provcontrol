# PRD: Migración de Replit a Entorno Local Independiente
## Provcontrol - Plan de Migración y Desacoplamiento

**Versión:** 1.0  
**Fecha:** Enero 2025  
**Estado:** En Planificación

---

## 1. Resumen Ejecutivo

### Objetivo
Migrar completamente la aplicación Provcontrol de su dependencia actual de Replit a un entorno de desarrollo y producción local independiente, eliminando todas las dependencias específicas de Replit y estableciendo una infraestructura autónoma.

### Alcance
- Eliminación de todas las dependencias de Replit (autenticación, plugins, configuración)
- Implementación de sistema de autenticación independiente
- Configuración de PostgreSQL local para desarrollo
- Actualización de configuración de build y desarrollo
- Documentación de setup local

---

## 2. Análisis de Dependencias Actuales

### 2.1 Dependencias de Replit Identificadas

#### Autenticación
- **Archivo:** `server/replitAuth.ts`
- **Dependencias:**
  - `openid-client` con OIDC de Replit (`https://replit.com/oidc`)
  - Variable de entorno `REPL_ID` (requerida)
  - Variable de entorno `ISSUER_URL` (default: Replit OIDC)
- **Impacto:** CRÍTICO - Toda la autenticación depende de Replit

#### Plugins de Vite
- **Archivo:** `vite.config.ts`
- **Dependencias:**
  - `@replit/vite-plugin-cartographer` (devDependency)
  - `@replit/vite-plugin-dev-banner` (devDependency)
  - `@replit/vite-plugin-runtime-error-modal` (devDependency)
- **Impacto:** MEDIO - Solo afecta desarrollo, no producción

#### Configuración
- **Archivo:** `.replit`
- **Contenido:** Configuración específica de Replit
- **Impacto:** BAJO - Solo necesario en Replit

#### Documentación
- **Archivo:** `replit.md`
- **Contenido:** Documentación que menciona Replit
- **Impacto:** BAJO - Solo documentación

#### Referencias en Código
- Comentarios en `shared/schema.ts` mencionando "Replit Auth"
- Comentarios en `client/src/hooks/useAuth.ts`
- Texto en UI: `client/src/pages/Settings.tsx` menciona "Replit Auth"

### 2.2 Base de Datos Actual
- **Tipo:** Neon Serverless PostgreSQL (via `@neondatabase/serverless`)
- **Estado:** Ya es independiente de Replit, pero requiere URL de conexión
- **Acción:** Configurar PostgreSQL local para desarrollo

---

## 3. Plan de Migración

### Fase 1: Preparación y Análisis ✅
**Estado:** COMPLETADO
- [x] Identificar todas las dependencias de Replit
- [x] Documentar impacto de cada dependencia
- [x] Crear PRD de migración

### Fase 2: Sistema de Autenticación Local
**Prioridad:** ALTA  
**Estimación:** 2-3 días

#### 2.1 Opciones de Autenticación

**Opción A: Email/Password con JWT (Recomendada)**
- ✅ Simple y directo
- ✅ Sin dependencias externas
- ✅ Control total
- ✅ Fácil de implementar
- Librerías: `bcryptjs`, `jsonwebtoken`

**Opción B: OAuth Genérico (Google/GitHub)**
- ✅ Más seguro (sin manejar passwords)
- ✅ Mejor UX
- ❌ Requiere configuración de OAuth providers
- Librerías: `passport-google-oauth20`, `passport-github2`

**Opción C: Híbrido (Email/Password + OAuth opcional)**
- ✅ Máxima flexibilidad
- ✅ Mejor para usuarios
- ❌ Más complejo de implementar

**DECISIÓN:** Opción A (Email/Password) para MVP, Opción C para futuro

#### 2.2 Tareas de Implementación

1. **Crear nuevo módulo de autenticación**
   - Archivo: `server/auth.ts` (reemplazar `replitAuth.ts`)
   - Implementar:
     - Registro de usuarios (email/password)
     - Login (email/password)
     - JWT token generation/validation
     - Password hashing con bcrypt
     - Middleware de autenticación
     - Refresh tokens (opcional para MVP)

2. **Actualizar esquema de base de datos**
   - Modificar tabla `users`:
     - Agregar `email` (único, requerido)
     - Agregar `password_hash` (requerido)
     - Eliminar dependencia de `sub` de Replit
     - Mantener `id` como UUID
   - Crear migración Drizzle

3. **Actualizar rutas de autenticación**
   - `POST /api/auth/register` - Registro
   - `POST /api/auth/login` - Login
   - `POST /api/auth/logout` - Logout
   - `GET /api/auth/user` - Obtener usuario actual
   - `POST /api/auth/refresh` - Refresh token (opcional)

4. **Actualizar frontend**
   - Modificar `client/src/hooks/useAuth.ts`
   - Crear componente de Login/Register
   - Actualizar `client/src/pages/Settings.tsx`
   - Eliminar referencias a Replit Auth

5. **Actualizar middleware**
   - Reemplazar `isAuthenticated` de `replitAuth.ts`
   - Validar JWT tokens
   - Extraer usuario del token

### Fase 3: Configuración de Base de Datos Local
**Prioridad:** ALTA  
**Estimación:** 1 día

#### 3.1 Opciones de PostgreSQL

**Opción A: PostgreSQL Local (Recomendada para desarrollo)**
- Instalar PostgreSQL 16 via Homebrew
- Crear base de datos local
- Configurar conexión

**Opción B: Docker PostgreSQL**
- Usar Docker Compose
- Más fácil de compartir entre desarrolladores
- Aislado del sistema

**Opción C: Neon/Supabase (Producción)**
- Mantener para producción
- Usar local para desarrollo

**DECISIÓN:** Opción A para desarrollo local, Opción C para producción

#### 3.2 Tareas

1. **Instalar PostgreSQL local**
   ```bash
   brew install postgresql@16
   brew services start postgresql@16
   createdb provcontrol
   ```

2. **Actualizar configuración de base de datos**
   - Modificar `server/db.ts`:
     - Soporte para PostgreSQL estándar (no solo Neon)
     - Usar `pg` en lugar de `@neondatabase/serverless` para local
     - Mantener compatibilidad con Neon para producción

3. **Crear script de setup**
   - `scripts/setup-db.sh` - Crear DB y ejecutar migraciones
   - `scripts/reset-db.sh` - Resetear DB para desarrollo

4. **Actualizar variables de entorno**
   - `DATABASE_URL` para desarrollo local: `postgresql://localhost:5432/provcontrol`
   - Documentar en `.env.example`

5. **Ejecutar migraciones**
   - `npm run db:push` o `npm run db:migrate`
   - Verificar que todas las tablas se crean correctamente

### Fase 4: Eliminación de Plugins de Replit
**Prioridad:** MEDIA  
**Estimación:** 0.5 días

#### 4.1 Tareas

1. **Eliminar plugins de Vite**
   - Remover de `package.json`:
     - `@replit/vite-plugin-cartographer`
     - `@replit/vite-plugin-dev-banner`
     - `@replit/vite-plugin-runtime-error-modal`
   - Actualizar `vite.config.ts`:
     - Eliminar imports de plugins de Replit
     - Reemplazar `runtimeErrorOverlay` con alternativa estándar o eliminar

2. **Alternativas**
   - Para error overlay: Usar el overlay nativo de Vite
   - Para dev banner: Eliminar (no necesario)
   - Para cartographer: Eliminar (solo para Replit)

### Fase 5: Limpieza de Código y Documentación
**Prioridad:** MEDIA  
**Estimación:** 1 día

#### 5.1 Tareas

1. **Eliminar archivos de Replit**
   - Eliminar `.replit`
   - Actualizar o eliminar `replit.md`

2. **Actualizar comentarios y referencias**
   - Buscar y reemplazar "Replit" en comentarios
   - Actualizar `shared/schema.ts`
   - Actualizar `client/src/hooks/useAuth.ts`
   - Actualizar `client/src/pages/Settings.tsx`

3. **Actualizar documentación**
   - Crear `README.md` con instrucciones de setup local
   - Crear `.env.example` con todas las variables necesarias
   - Documentar proceso de autenticación
   - Documentar setup de base de datos

4. **Actualizar package.json**
   - Cambiar nombre si es necesario
   - Actualizar scripts si es necesario
   - Agregar scripts de DB: `db:setup`, `db:reset`

### Fase 6: Testing y Validación
**Prioridad:** ALTA  
**Estimación:** 1-2 días

#### 6.1 Tareas

1. **Testing de autenticación**
   - Probar registro de usuarios
   - Probar login/logout
   - Probar protección de rutas
   - Probar refresh tokens (si implementado)

2. **Testing de base de datos**
   - Verificar todas las operaciones CRUD
   - Probar migraciones
   - Verificar integridad de datos

3. **Testing de frontend**
   - Verificar que todas las páginas cargan
   - Verificar que la autenticación funciona en UI
   - Verificar que no hay errores en consola

4. **Testing de build**
   - Verificar que `npm run build` funciona
   - Verificar que `npm run start` funciona
   - Verificar que no hay referencias a Replit en build

---

## 4. Estructura de Archivos Propuesta

```
provcontrol/
├── server/
│   ├── auth.ts              # NUEVO: Autenticación local (reemplaza replitAuth.ts)
│   ├── db.ts                # ACTUALIZAR: Soporte PostgreSQL local
│   ├── routes.ts            # ACTUALIZAR: Usar nuevo auth
│   └── ...
├── client/
│   └── src/
│       ├── pages/
│       │   ├── Login.tsx    # NUEVO: Página de login
│       │   ├── Register.tsx # NUEVO: Página de registro
│       │   └── Settings.tsx # ACTUALIZAR: Eliminar referencias Replit
│       └── hooks/
│           └── useAuth.ts   # ACTUALIZAR: Usar nuevo sistema
├── scripts/
│   ├── setup-db.sh          # NUEVO: Setup de base de datos
│   └── reset-db.sh          # NUEVO: Reset de base de datos
├── .env.example             # NUEVO: Ejemplo de variables de entorno
├── README.md                 # ACTUALIZAR: Instrucciones de setup
├── MIGRATION_PRD.md          # ESTE ARCHIVO
└── ...
```

---

## 5. Dependencias a Agregar

### Producción
```json
{
  "bcryptjs": "^2.4.3",           // Password hashing
  "jsonwebtoken": "^9.0.2",       // JWT tokens
  "pg": "^8.11.3"                 // PostgreSQL client (para local)
}
```

### Desarrollo
```json
{
  "@types/bcryptjs": "^2.4.6",
  "@types/jsonwebtoken": "^9.0.5",
  "@types/pg": "^8.10.9"
}
```

### Dependencias a Eliminar
```json
{
  "@replit/vite-plugin-cartographer": "^0.4.2",
  "@replit/vite-plugin-dev-banner": "^0.1.1",
  "@replit/vite-plugin-runtime-error-modal": "^0.0.3",
  "openid-client": "^6.8.1",      // Solo si no se usa OAuth
  "passport": "^0.7.0",           // Solo si no se usa OAuth
  "@neondatabase/serverless": "^0.10.4"  // Mantener para producción, agregar pg para local
}
```

---

## 6. Variables de Entorno

### Nuevas Variables Requeridas
```env
# Base de datos
DATABASE_URL=postgresql://localhost:5432/provcontrol

# Autenticación
JWT_SECRET=your-secret-key-here  # Generar con: openssl rand -hex 32
JWT_EXPIRES_IN=7d
SESSION_SECRET=your-session-secret-here

# Aplicación
PORT=3000
NODE_ENV=development
```

### Variables a Eliminar
```env
REPL_ID=                    # Ya no necesario
ISSUER_URL=                 # Ya no necesario (era para Replit OIDC)
```

---

## 7. Cronograma Estimado

| Fase | Tareas | Estimación | Dependencias |
|------|--------|------------|--------------|
| Fase 1 | Análisis | ✅ COMPLETADO | - |
| Fase 2 | Autenticación Local | 2-3 días | - |
| Fase 3 | PostgreSQL Local | 1 día | Fase 2 |
| Fase 4 | Eliminar Plugins | 0.5 días | - |
| Fase 5 | Limpieza | 1 día | Fases 2-4 |
| Fase 6 | Testing | 1-2 días | Todas las anteriores |
| **TOTAL** | | **5.5-7.5 días** | |

---

## 8. Riesgos y Mitigación

### Riesgo 1: Pérdida de datos de usuarios existentes
- **Mitigación:** Crear script de migración de usuarios de Replit a nuevo sistema (si hay datos)

### Riesgo 2: Cambios en flujo de autenticación afecten UX
- **Mitigación:** Mantener misma estructura de sesión, solo cambiar backend

### Riesgo 3: Problemas con PostgreSQL local
- **Mitigación:** Documentar bien el setup, ofrecer Docker como alternativa

### Riesgo 4: Incompatibilidades con código existente
- **Mitigación:** Testing exhaustivo, mantener estructura de datos similar

---

## 9. Criterios de Éxito

- [ ] La aplicación funciona completamente sin Replit
- [ ] Usuarios pueden registrarse y hacer login con email/password
- [ ] Base de datos PostgreSQL local funciona correctamente
- [ ] Todas las funcionalidades existentes siguen funcionando
- [ ] No hay referencias a Replit en el código
- [ ] Documentación actualizada
- [ ] Build de producción funciona
- [ ] Tests pasan (si existen)

---

## 10. Próximos Pasos

1. **Revisar y aprobar este PRD**
2. **Crear branch de migración:** `git checkout -b migration/remove-replit`
3. **Comenzar con Fase 2:** Implementar autenticación local
4. **Seguir fases secuencialmente**
5. **Testing continuo durante desarrollo**

---

## 11. Notas Adicionales

### Consideraciones Futuras
- Implementar OAuth (Google/GitHub) como opción adicional
- Considerar 2FA (Two-Factor Authentication)
- Implementar recuperación de contraseña
- Considerar rate limiting para endpoints de autenticación

### Mejores Prácticas
- Usar variables de entorno para todos los secrets
- Implementar validación robusta de inputs
- Usar HTTPS en producción
- Implementar logging de seguridad
- Considerar CSRF protection

---

**Documento creado:** 2025-01-XX  
**Última actualización:** 2025-01-XX  
**Autor:** Equipo de Desarrollo Provcontrol

