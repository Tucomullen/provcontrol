#!/bin/bash

# Script para resetear la base de datos PostgreSQL local
# ADVERTENCIA: Esto eliminará todos los datos
# Uso: ./scripts/reset-db.sh

set -e

echo "⚠️  ADVERTENCIA: Esto eliminará todos los datos de la base de datos 'provcontrol'"
read -p "¿Estás seguro? (escribe 'yes' para continuar): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Operación cancelada"
    exit 1
fi

echo "🗑️  Eliminando base de datos..."
export PATH="/usr/local/opt/postgresql@16/bin:$PATH"
dropdb provcontrol 2>/dev/null || echo "   Base de datos no existe"

echo "📦 Creando nueva base de datos..."
createdb provcontrol

echo "✅ Base de datos reseteada correctamente!"
echo ""
echo "📝 Ejecuta las migraciones:"
echo "   npm run db:push"
echo ""

