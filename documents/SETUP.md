# Guía de Configuración Local - Provcontrol

Esta guía te ayudará a configurar Provcontrol en tu entorno local sin dependencias de Replit.

## Prerrequisitos

- Node.js 20 o superior
- PostgreSQL 16 (se instalará automáticamente si usas los scripts)
- npm o yarn

## Configuración Inicial

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar PostgreSQL Local

#### Opción A: Usar el script automático (recomendado)

```bash
./scripts/setup-db.sh
```

Este script:
- Verifica/instala PostgreSQL 16
- Inicia el servicio
- Crea la base de datos `provcontrol`

#### Opción B: Configuración manual

```bash
# Instalar PostgreSQL
brew install postgresql@16

# Iniciar servicio
brew services start postgresql@16

# Agregar al PATH (agregar a ~/.zshrc o ~/.bashrc)
export PATH="/usr/local/opt/postgresql@16/bin:$PATH"

# Crear base de datos
createdb provcontrol
```

### 3. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con:

```env
# Base de Datos
DATABASE_URL=postgresql://localhost:5432/provcontrol

# Autenticación
# Genera secrets seguros con: openssl rand -hex 32
JWT_SECRET=tu-jwt-secret-aqui
JWT_EXPIRES_IN=7d
SESSION_SECRET=tu-session-secret-aqui

# Aplicación
PORT=3000
NODE_ENV=development
```

**⚠️ Importante:** Nunca commitees el archivo `.env` al repositorio. Usa valores diferentes para desarrollo y producción.

### 4. Ejecutar Migraciones

```bash
npm run db:push
```

Esto creará todas las tablas necesarias en la base de datos.

### 5. Iniciar el Servidor

```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

## Scripts Disponibles

### Setup de Base de Datos
```bash
./scripts/setup-db.sh
```
Configura PostgreSQL y crea la base de datos.

### Reset de Base de Datos
```bash
./scripts/reset-db.sh
```
⚠️ **ADVERTENCIA:** Elimina todos los datos y recrea la base de datos.

### Migraciones
```bash
npm run db:push
```
Aplica los cambios del esquema a la base de datos.

## Estructura de Base de Datos

La aplicación usa **Drizzle ORM** para gestionar el esquema. El esquema está definido en `shared/schema.ts`.

### Tablas Principales

- `users` - Usuarios del sistema
- `communities` - Comunidades de propietarios
- `providers` - Proveedores de servicios
- `incidents` - Incidencias reportadas
- `budgets` - Presupuestos
- `ratings` - Calificaciones verificables
- `documents` - Documentos de la comunidad
- `forum_posts` - Posts del foro
- `forum_replies` - Respuestas del foro
- `transactions` - Transacciones contables
- `notifications` - Notificaciones

## Autenticación

El sistema usa autenticación local con JWT y sesiones:

- **Registro:** `POST /api/auth/register`
- **Login:** `POST /api/auth/login`
- **Logout:** `POST /api/auth/logout`
- **Usuario actual:** `GET /api/auth/user`

## Desarrollo

### Modo Desarrollo

```bash
npm run dev
```

- Hot reload habilitado
- Errores detallados en consola
- Vite dev server para el frontend

### Build de Producción

```bash
npm run build
npm start
```

## Solución de Problemas

### PostgreSQL no se inicia

```bash
brew services restart postgresql@16
```

### Error de conexión a la base de datos

1. Verifica que PostgreSQL esté corriendo: `pg_isready`
2. Verifica que la base de datos existe: `psql -l | grep provcontrol`
3. Verifica la URL en `.env`: `DATABASE_URL=postgresql://localhost:5432/provcontrol`

### Error en migraciones

```bash
# Resetear base de datos
./scripts/reset-db.sh

# Re-ejecutar migraciones
npm run db:push
```

### Puerto 3000 ocupado

Cambia el puerto en `.env`:
```env
PORT=3001
```

## Producción

Para producción, puedes usar:

- **Neon** (PostgreSQL serverless): https://neon.tech
- **Supabase**: https://supabase.com
- **Railway**: https://railway.app
- **Render**: https://render.com

Solo necesitas cambiar la `DATABASE_URL` en las variables de entorno de producción.

## Soporte

Si encuentras problemas, revisa:
- Los logs del servidor en la consola
- Los logs de PostgreSQL: `tail -f /usr/local/var/log/postgresql@16.log`
- El estado del servicio: `brew services list`

