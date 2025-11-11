# Plan de Acción: Migración de Replit a Local
## Resumen Ejecutivo

### Objetivo
Eliminar todas las dependencias de Replit y hacer la aplicación completamente independiente.

---

## 📋 Checklist de Migración

### ✅ Fase 1: Análisis (COMPLETADO)
- [x] Identificar dependencias de Replit
- [x] Crear PRD de migración

### 🔄 Fase 2: Autenticación Local (PRÓXIMO)
**Prioridad:** ALTA | **Tiempo:** 2-3 días

- [ ] Crear `server/auth.ts` (reemplazar `replitAuth.ts`)
  - [ ] Implementar registro (email/password)
  - [ ] Implementar login (email/password)
  - [ ] JWT token generation
  - [ ] Password hashing (bcrypt)
  - [ ] Middleware de autenticación

- [ ] Actualizar esquema de base de datos
  - [ ] Agregar `email` y `password_hash` a tabla `users`
  - [ ] Crear migración Drizzle

- [ ] Actualizar rutas API
  - [ ] `POST /api/auth/register`
  - [ ] `POST /api/auth/login`
  - [ ] `POST /api/auth/logout`
  - [ ] `GET /api/auth/user`

- [ ] Actualizar frontend
  - [ ] Crear página de Login
  - [ ] Crear página de Registro
  - [ ] Actualizar `useAuth.ts`
  - [ ] Actualizar `Settings.tsx`

### 🔄 Fase 3: PostgreSQL Local
**Prioridad:** ALTA | **Tiempo:** 1 día

- [ ] Instalar PostgreSQL local
  ```bash
  brew install postgresql@16
  brew services start postgresql@16
  createdb provcontrol
  ```

- [ ] Actualizar `server/db.ts`
  - [ ] Soporte para PostgreSQL estándar (pg)
  - [ ] Mantener compatibilidad con Neon para producción

- [ ] Crear scripts de setup
  - [ ] `scripts/setup-db.sh`
  - [ ] `scripts/reset-db.sh`

- [ ] Ejecutar migraciones
  ```bash
  npm run db:push
  ```

### 🔄 Fase 4: Eliminar Plugins de Replit
**Prioridad:** MEDIA | **Tiempo:** 0.5 días

- [ ] Eliminar de `package.json`:
  - [ ] `@replit/vite-plugin-cartographer`
  - [ ] `@replit/vite-plugin-dev-banner`
  - [ ] `@replit/vite-plugin-runtime-error-modal`

- [ ] Actualizar `vite.config.ts`
  - [ ] Eliminar imports de Replit
  - [ ] Usar error overlay nativo de Vite

### 🔄 Fase 5: Limpieza
**Prioridad:** MEDIA | **Tiempo:** 1 día

- [ ] Eliminar archivos
  - [ ] `.replit`
  - [ ] Actualizar/eliminar `replit.md`

- [ ] Actualizar comentarios
  - [ ] Buscar/reemplazar "Replit" en código
  - [ ] Actualizar `shared/schema.ts`
  - [ ] Actualizar `client/src/hooks/useAuth.ts`
  - [ ] Actualizar `client/src/pages/Settings.tsx`

- [ ] Documentación
  - [ ] Crear `README.md` con setup local
  - [ ] Crear `.env.example`
  - [ ] Documentar autenticación

### 🔄 Fase 6: Testing
**Prioridad:** ALTA | **Tiempo:** 1-2 días

- [ ] Testing de autenticación
- [ ] Testing de base de datos
- [ ] Testing de frontend
- [ ] Testing de build

---

## 🚀 Inicio Rápido

### Para empezar AHORA:

1. **Crear branch:**
   ```bash
   git checkout -b migration/remove-replit
   ```

2. **Instalar dependencias nuevas:**
   ```bash
   npm install bcryptjs jsonwebtoken pg
   npm install -D @types/bcryptjs @types/jsonwebtoken @types/pg
   ```

3. **Instalar PostgreSQL:**
   ```bash
   brew install postgresql@16
   brew services start postgresql@16
   createdb provcontrol
   ```

4. **Comenzar con Fase 2:** Implementar autenticación local

---

## 📦 Dependencias a Agregar

```json
{
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.2",
  "pg": "^8.11.3"
}
```

## 🗑️ Dependencias a Eliminar

```json
{
  "@replit/vite-plugin-cartographer": "^0.4.2",
  "@replit/vite-plugin-dev-banner": "^0.1.1",
  "@replit/vite-plugin-runtime-error-modal": "^0.0.3"
}
```

---

## 🔐 Variables de Entorno Necesarias

```env
# Base de datos
DATABASE_URL=postgresql://localhost:5432/provcontrol

# Autenticación
JWT_SECRET=tu-secret-key-aqui
JWT_EXPIRES_IN=7d
SESSION_SECRET=tu-session-secret-aqui

# Aplicación
PORT=3000
NODE_ENV=development
```

---

## ⏱️ Tiempo Total Estimado: 5.5-7.5 días

---

**Ver PRD completo:** `MIGRATION_PRD.md`

