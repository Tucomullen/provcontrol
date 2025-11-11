# Prompt Master para Cursor - Desarrollo Local de Provcontrol

## 🎯 Contexto del Proyecto

**Nombre:** Provcontrol  
**Descripción:** Plataforma de control vecinal y transparencia para comunidades de propietarios españolas con sistema de rating verificable de proveedores, gestión de incidencias y marketplace de presupuestos.

**Estado Actual:**
- ✅ Migración de Replit completada (6 fases finalizadas)
- ✅ Autenticación local con JWT + bcrypt
- ✅ PostgreSQL local funcionando
- ✅ Build sin dependencias de Replit
- ✅ API funcionando con 14 tablas
- ✅ Sistema de subida de archivos en carpeta local `uploads/`
- ⏳ Frontend en desarrollo

---

## 📋 Guías de Desarrollo

### Para Desarrollo de Características Nuevas

**Instrucción base para Cursor:**

```
Estoy desarrollando Provcontrol, una plataforma de gestión comunitaria.

CONTEXTO TÉCNICO:
- Stack: React (frontend) + Express (backend) + PostgreSQL (base de datos)
- Autenticación: JWT + express-session + bcrypt
- Base de datos: PostgreSQL 16 local (postgresql://localhost:5432/provcontrol)
- ORM: Drizzle ORM con migraciones automáticas
- Almacenamiento: Carpeta local "uploads/" (para desarrollo)
- Build: Vite + React + TypeScript
- Puertos: Frontend 5173 (dev), Backend 3000, Database 5432

ESTRUCTURA:
- /src - Frontend React
- /server - Backend Express
- /shared - Tipos compartidos
- /schema - Drizzle schema
- /uploads - Almacenamiento local de archivos

INSTRUCCIONES CRÍTICAS:

1. **Almacenamiento de Archivos - IMPORTANTE PARA MIGRACIÓN CLOUD:**
   - SIEMPRE usa la abstracción de storage en "server/storage/index.ts"
   - NUNCA escribas rutas hardcodeadas a "uploads/" directamente
   - Usa "StorageProvider" interface para subidas/descargas
   - El objeto "storage" contiene métodos:
     * upload(buffer, fileName) -> Promise<string> (devuelve URL)
     * delete(fileId) -> Promise<void>
     * getUrl(fileId) -> string
   - Esto permite cambiar a S3/Wasabi/Cloudflare R2 sin cambiar lógica de negocio

2. **Base de Datos:**
   - Usa Drizzle ORM (NO SQL crudo)
   - Crea migraciones para cambios de schema
   - Tipos están en /shared/schema.ts
   - Pool de conexiones configurado en server/db.ts

3. **API REST:**
   - Endpoints en /server/routes.ts
   - Middleware de autenticación: requireAuth (usa JWT del header)
   - Respuestas JSON con estructura: { success: true/false, data: ..., error: ... }
   - Status codes: 200, 201, 400, 401, 403, 404, 500

4. **Variables de Entorno:**
   - DATABASE_URL=postgresql://localhost:5432/provcontrol
   - JWT_SECRET=[generado con openssl rand -hex 32]
   - SESSION_SECRET=[generado con openssl rand -hex 32]
   - NODE_ENV=development
   - STORAGE_PROVIDER=local (cambiar a "s3" más adelante)
   - Agregar nuevas vars SIEMPRE en .env

5. **Autenticación:**
   - Login devuelve JWT en header Authorization: Bearer <token>
   - Sesión guardada en table "sessions" (express-session)
   - req.user tiene { id, email, role }
   - Rutas protegidas con middleware requireAuth

6. **Frontend:**
   - Usa hook useAuth() para estado de usuario
   - useAuth() devuelve { user, login, logout, refetch }
   - Componentes en /src/pages y /src/components
   - Tipos compartidos desde /shared/schema.ts
   - Estilos con Tailwind + Shadcn/ui

7. **Desarrollo Local:**
   - Backend: npm run dev (Express + hot reload)
   - Frontend: npm run dev (Vite + React Refresh)
   - Database: PostgreSQL corre automáticamente
   - No necesita dependencias de Replit

ANTES DE HACER CAMBIOS:
- Revisa /ARCHITECTURE.md para entender flujos existentes
- Revisa /SETUP.md para comandos útiles
- Revisa schema en /shared/schema.ts
- Busca ejemplos similares en código existente
- Agrupa cambios backend/frontend relacionados

CUANDO TERMINES:
- Verifica que npm run build compile sin errores
- Verifica que npm run dev inicia sin errores
- Prueba la funcionalidad en http://localhost:3000
- Revisa console del navegador y logs del servidor

MIGRACIÓN A CLOUD (FUTURO):
- Solo cambia implementación de StorageProvider a S3/Wasabi
- TODO lo demás sigue igual
- No hay cambios en API endpoints
- No hay cambios en lógica de negocio
```

---

### Para Arreglar Errores

```
Estoy debuggeando Provcontrol.

ERROR: [aquí describe el error]

CONTEXTO:
- Comando que ejecuté: [npm run dev, npm run build, etc]
- Logs del error: [pega los logs]
- Archivo donde ocurre: [ruta del archivo]

INFORMACIÓN DEL PROYECTO:
- Base de datos: PostgreSQL 16 local
- Autenticación: JWT en headers
- Storage: Carpeta local "uploads/" via StorageProvider interface
- ORM: Drizzle

PISTA: [opcional - qué crees que es el problema]

Por favor:
1. Identifica la causa raíz
2. Explica qué salió mal
3. Proporciona solución específica
4. Verifica que la solución no rompa otras cosas
```

---

### Para Agregar Nuevas Tablas / Schemas

```
Quiero agregar una nueva entidad a Provcontrol: [nombre]

REQUERIMIENTOS:
- Campos: [lista de campos con tipos]
- Relaciones: [si se relaciona con otras tablas]
- Restricciones: [unique, not null, etc]
- Índices: [campos frecuentemente filtrados]

Por favor:
1. Crea schema en /shared/schema.ts (tipo Drizzle)
2. Genera migración automática
3. Crea endpoint API básico CRUD
4. Devuelve código listo para implementar
5. Incluye ejemplo de uso en frontend

NOTA: Asegúrate de usar StorageProvider si maneja archivos.
```

---

### Para Cambios de Autenticación/Seguridad

```
Quiero modificar el sistema de autenticación/seguridad: [cambio]

CRÍTICO - Estos cambios afectan todo el sistema:
- NO elimines JWT_SECRET ni SESSION_SECRET sin migrar sesiones
- Todos los endpoints deben verificar req.user.id (existente)
- Middleware requireAuth DEBE estar en rutas protegidas
- Contraseñas SIEMPRE hasheadas con bcrypt
- Nunca devuelvas password_hash en respuestas API

REVISA ANTES:
- /server/auth.ts (lógica de autenticación)
- /server/routes.ts (middlewares aplicados)
- /shared/schema.ts (tipos de usuario)
- /ARCHITECTURE.md (flujos de seguridad)

Proporciona:
1. Cambios necesarios
2. Impacto en otros sistemas
3. Testing para verificar
```

---

## 🔧 Comandos Útiles

```bash
# Desarrollo
npm run dev              # Inicia todo (frontend + backend)
npm run db:push         # Ejecuta migraciones
npm run db:studio       # Abre GUI de base de datos

# Build
npm run build           # Compilación completa
npm run preview         # Preview de production build

# Database
npm run db:generate     # Genera tipos de Drizzle
npm run db:seed         # [Si tienes seeders]

# Limpieza
rm -rf uploads/*        # Limpia archivos subidos
npm run db:reset        # [Si necesitas resetear DB]
```

---

## 📁 Rutas de Archivos Importantes

```
/SETUP.md                       # Guía de setup inicial
/ARCHITECTURE.md                # Documentación técnica
/README.md                      # Descripción del proyecto
/MIGRATION_PRD.md              # Plan de migración (histórico)

/src/pages/                    # Páginas principales
/src/components/               # Componentes reutilizables
/src/hooks/useAuth.ts          # Hook de autenticación

/server/routes.ts              # Endpoints API
/server/auth.ts                # Lógica de autenticación
/server/storage/               # Abstracción de almacenamiento
/server/db.ts                  # Conexión a BD

/shared/schema.ts              # Tipos y schema Drizzle
/schema/                        # Migraciones Drizzle

.env                           # Variables de entorno (NO comitear)
package.json                   # Dependencias
vite.config.ts                 # Configuración Vite
```

---

## 🚨 REGLAS CRÍTICAS (Nunca Romper)

❌ **NO HACER:**
- Hardcodear rutas a carpeta local: `${__dirname}/uploads/...`
- SQL crudo: siempre usar Drizzle ORM
- Almacenar contraseñas en plain text
- Devolver password_hash en respuestas API
- Confiar en cookies sin validar JWT
- Cambiar estructura de Base de Datos sin migración
- Usar dependencias de Replit (ya eliminadas)

✅ **SIEMPRE HACER:**
- Usar StorageProvider para cualquier archivo
- Usar requireAuth para rutas que necesiten usuario
- Validar entrada de usuario
- Hashear contraseñas con bcrypt
- Migrar cambios de schema con Drizzle
- Documentar cambios importantes
- Probar que npm run build funcione

---

## 🎓 Ejemplos de Código

### Endpoint Protegido con Almacenamiento
```typescript
// /server/routes.ts
app.post('/api/incidents', requireAuth, async (req, res) => {
  const { title, description, photos } = req.body;
  
  // Almacenar archivos
  const photoUrls: string[] = [];
  for (const photo of photos) {
    const url = await storage.upload(photo.buffer, photo.name);
    photoUrls.push(url);
  }
  
  // Guardar en BD
  const incident = await db.insert(incidents).values({
    title,
    description,
    photos: photoUrls,
    userId: req.user.id,
  });
  
  res.json({ success: true, data: incident });
});
```

### Hook de Autenticación
```typescript
// /src/hooks/useAuth.ts
const { user, login, logout } = useAuth();

if (user) {
  console.log(`Usuario: ${user.email}, Rol: ${user.role}`);
}

await login(email, password);
await logout();
```

### Query a Base de Datos
```typescript
// Siempre con Drizzle ORM
const user = await db.select().from(users)
  .where(eq(users.email, email))
  .limit(1);
```

---

## 🌐 Migración a Cloud (Checklist Futuro)

Cuando sea hora de ir a producción, SOLO necesitas:

- [ ] Crear bucket S3 (Wasabi/AWS/Cloudflare)
- [ ] Crear implementación S3 de StorageProvider
- [ ] Cambiar STORAGE_PROVIDER en .env a "s3"
- [ ] Configurar credentials AWS en variables de entorno
- [ ] Probar uploads en staging
- [ ] Migrar archivos históricos
- [ ] Cambiar STORAGE_PROVIDER a "s3" en producción

**Todo lo demás NO cambia - API endpoints igual, lógica de negocio igual, frontend igual.**

---

## 📞 Cuándo Usar Este Prompt

Usa DIFERENTES prompts para diferentes tareas:

1. **Base:** "Estoy desarrollando Provcontrol..." para desarrollo normal
2. **Errores:** "Estoy debuggeando..." para arreglar bugs
3. **Nuevos schemas:** "Quiero agregar..." para nuevas tablas
4. **Seguridad:** "Quiero modificar auth..." para cambios críticos

---

## 🎯 Objetivo Final

Al terminar, la app debe poder migrar a producción en 1-2 días:
- ✅ Cambiar StorageProvider a S3
- ✅ Configurar vars de entorno cloud
- ✅ Deploy a servidor (Vercel, Railway, Render)
- ✅ Listo para 4000+ clientes

Sin cambios de código de negocio, sin cambios de API, sin cambios de frontend.
