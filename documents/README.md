# Provcontrol

Plataforma de control vecinal y transparencia para comunidades de propietarios. Sistema de rating verificable de proveedores, gestión de incidencias y marketplace de presupuestos.

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 20 o superior
- PostgreSQL 16
- npm o yarn

### Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd provcontrol
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar base de datos**
   ```bash
   ./scripts/setup-db.sh
   ```

4. **Configurar variables de entorno**
   
   Crea un archivo `.env` en la raíz del proyecto:
   ```env
   DATABASE_URL=postgresql://localhost:5432/provcontrol
   JWT_SECRET=$(openssl rand -hex 32)
   SESSION_SECRET=$(openssl rand -hex 32)
   PORT=3000
   NODE_ENV=development
   ```

5. **Ejecutar migraciones**
   ```bash
   npm run db:push
   ```

6. **Iniciar servidor de desarrollo**
   ```bash
   npm run dev
   ```

La aplicación estará disponible en `http://localhost:3000`

## 📚 Documentación

- **[SETUP.md](./SETUP.md)** - Guía detallada de configuración local
- **[MIGRATION_PRD.md](./MIGRATION_PRD.md)** - Plan de migración de Replit (completado)
- **[MIGRATION_PLAN.md](./MIGRATION_PLAN.md)** - Plan de acción de migración

## 🏗️ Arquitectura

### Stack Tecnológico

**Frontend:**
- React 18 con TypeScript
- Vite como bundler
- Tailwind CSS + Shadcn/ui
- Wouter para routing
- TanStack Query para data fetching

**Backend:**
- Node.js con Express
- TypeScript
- Drizzle ORM
- PostgreSQL (local o Neon serverless)
- JWT para autenticación

**Base de Datos:**
- PostgreSQL 16
- Drizzle ORM para migraciones y queries

## 🔐 Autenticación

El sistema usa autenticación local con JWT y sesiones:

- **Registro:** `POST /api/auth/register`
- **Login:** `POST /api/auth/login`
- **Logout:** `POST /api/auth/logout`
- **Usuario actual:** `GET /api/auth/user`

## 📦 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo

# Build
npm run build        # Compila para producción
npm start            # Inicia servidor de producción

# Base de datos
npm run db:push      # Aplica migraciones a la base de datos
./scripts/setup-db.sh    # Configura PostgreSQL local
./scripts/reset-db.sh    # Resetea la base de datos (⚠️ elimina datos)

# Utilidades
npm run check        # Verifica tipos TypeScript
```

## 🗂️ Estructura del Proyecto

```
provcontrol/
├── client/              # Frontend React
│   └── src/
│       ├── components/  # Componentes reutilizables
│       ├── pages/       # Páginas de la aplicación
│       ├── hooks/       # Custom hooks
│       └── lib/         # Utilidades
├── server/              # Backend Express
│   ├── auth.ts         # Sistema de autenticación
│   ├── db.ts           # Configuración de base de datos
│   ├── routes.ts       # Rutas de la API
│   └── storage.ts     # Capa de acceso a datos
├── shared/              # Código compartido
│   └── schema.ts       # Esquema de base de datos (Drizzle)
├── scripts/             # Scripts de utilidad
└── dist/                # Build de producción
```

## 🎯 Características Principales

- ✅ **Sistema de Rating Verificable**: Calificaciones vinculadas a incidencias reales
- ✅ **Gestión de Incidencias**: Seguimiento completo del ciclo de vida
- ✅ **Marketplace de Presupuestos**: Comparación transparente de ofertas
- ✅ **Foro Comunitario**: Comunicación directa entre vecinos
- ✅ **Control Contable**: Gestión de transacciones y documentos
- ✅ **Roles y Permisos**: Presidente, Propietario, Proveedor

## 🔧 Configuración de Producción

Para producción, puedes usar:

- **Base de datos**: Neon, Supabase, Railway, Render
- **Hosting**: Vercel, Railway, Render, Fly.io
- **Variables de entorno**: Configurar en la plataforma de hosting

Ejemplo de `DATABASE_URL` para Neon:
```
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT.

## 🆘 Soporte

Para problemas o preguntas:
- Revisa la [documentación de setup](./SETUP.md)
- Abre un issue en el repositorio

---

**Desarrollado con ❤️ para comunidades de propietarios**

