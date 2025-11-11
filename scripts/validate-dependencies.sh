#!/bin/bash

# Validation script to ensure no direct database access outside of storage implementations
# This enforces the abstraction layer pattern for easy future migrations

set -e

echo "🔍 Validating database access patterns..."

VIOLATIONS=0

# Check for direct imports of ./db outside of storage implementations
# storage.ts is the implementation, so it's allowed to use db
echo "Checking for direct 'db' imports..."
DB_IMPORTS=$(grep -r "from.*['\"]\.\/db['\"]" server/ --include="*.ts" --exclude-dir="storage" --exclude="storage.ts" | grep -v "node_modules" || true)

if [ -n "$DB_IMPORTS" ]; then
  echo "❌ Found direct 'db' imports outside storage layer:"
  echo "$DB_IMPORTS"
  VIOLATIONS=$((VIOLATIONS + 1))
fi

# Check for direct db.select, db.insert, etc. usage
# storage.ts is the implementation, so it's allowed to use db operations
echo "Checking for direct database operations..."
DB_OPS=$(grep -r "db\.\(select\|insert\|update\|delete\)" server/ --include="*.ts" --exclude-dir="storage" --exclude="storage.ts" | grep -v "node_modules" || true)

if [ -n "$DB_OPS" ]; then
  echo "❌ Found direct database operations outside storage layer:"
  echo "$DB_OPS"
  VIOLATIONS=$((VIOLATIONS + 1))
fi

# Check that storage.ts doesn't export singleton (should use factory)
echo "Checking storage.ts exports..."
STORAGE_EXPORT=$(grep -r "export.*storage.*=" server/storage.ts || true)
if echo "$STORAGE_EXPORT" | grep -q "new DatabaseStorage"; then
  echo "⚠️  Warning: storage.ts exports singleton directly. Should use factory."
  # Not a violation, just a warning
fi

# Check that routes and auth use storage from data-storage
echo "Checking storage imports in routes and auth..."
ROUTES_IMPORT=$(grep "import.*storage.*from" server/routes.ts | grep -v "data-storage" || true)
AUTH_IMPORT=$(grep "import.*storage.*from" server/auth.ts | grep -v "data-storage" || true)

if [ -n "$ROUTES_IMPORT" ]; then
  echo "⚠️  Warning: routes.ts may not be using storage from data-storage"
fi

if [ -n "$AUTH_IMPORT" ]; then
  echo "⚠️  Warning: auth.ts may not be using storage from data-storage"
fi

# Summary
if [ $VIOLATIONS -eq 0 ]; then
  echo "✅ No violations found! Database access is properly abstracted."
  exit 0
else
  echo "❌ Found $VIOLATIONS violation(s). Please fix before proceeding."
  exit 1
fi

