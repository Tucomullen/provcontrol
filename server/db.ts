// Load environment variables first
import dotenv from "dotenv";
dotenv.config();

import { Pool as NeonPool, neonConfig } from '@neondatabase/serverless';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import { Pool as PgPool } from 'pg';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import ws from "ws";
import * as schema from "@shared/schema";

// Determine if we're using Neon (serverless) or standard PostgreSQL
function isNeonConnectionString(url: string): boolean {
  return url.includes('neon.tech') || url.includes('neon.tech') || url.includes('@neon.tech');
}

let pool: NeonPool | PgPool | null = null;
let db: ReturnType<typeof drizzleNeon> | ReturnType<typeof drizzlePg> | null = null;

if (process.env.DATABASE_URL) {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (isNeonConnectionString(databaseUrl)) {
    // Use Neon serverless PostgreSQL
    neonConfig.webSocketConstructor = ws;
    pool = new NeonPool({ connectionString: databaseUrl });
    db = drizzleNeon({ client: pool, schema });
    console.log("✅ Connected to Neon serverless PostgreSQL");
  } else {
    // Use standard PostgreSQL (local or other providers)
    pool = new PgPool({ connectionString: databaseUrl });
    db = drizzlePg({ client: pool, schema });
    console.log("✅ Connected to standard PostgreSQL");
  }
} else {
  // Local development mode - create a mock that will fail gracefully
  console.warn("⚠️  DATABASE_URL not set. Running in development mode without database.");
  console.warn("⚠️  API endpoints that require database will fail, but frontend will work.");
  pool = null;
  db = null;
}

export { pool, db };
