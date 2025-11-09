#!/bin/bash

# Script para configurar la base de datos PostgreSQL local
# Uso: ./scripts/setup-db.sh

set -e

echo "🔧 Configurando base de datos PostgreSQL local..."

# Verificar si PostgreSQL está instalado
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL no está instalado. Instalando..."
    brew install postgresql@16
    brew services start postgresql@16
    export PATH="/usr/local/opt/postgresql@16/bin:$PATH"
fi

# Verificar si el servicio está corriendo
if ! pg_isready -q 2>/dev/null; then
    echo "🚀 Iniciando servicio PostgreSQL..."
    brew services start postgresql@16
    sleep 2
fi

# Crear base de datos si no existe
echo "📦 Creando base de datos 'provcontrol'..."
export PATH="/usr/local/opt/postgresql@16/bin:$PATH"
createdb provcontrol 2>/dev/null || echo "   Base de datos ya existe"

# Verificar conexión
echo "✅ Verificando conexión..."
psql -d provcontrol -c "SELECT version();" > /dev/null

echo ""
echo "✅ Base de datos configurada correctamente!"
echo ""
echo "📝 Próximos pasos:"
echo "   1. Configura DATABASE_URL en tu archivo .env:"
echo "      DATABASE_URL=postgresql://localhost:5432/provcontrol"
echo "   2. Ejecuta las migraciones:"
echo "      npm run db:push"
echo ""

