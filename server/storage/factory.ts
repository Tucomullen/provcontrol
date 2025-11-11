/**
 * Storage Factory
 * 
 * Creates the appropriate storage implementation based on environment configuration.
 * This factory pattern allows easy switching between different storage backends
 * (PostgreSQL, PocketBase, etc.) without changing application code.
 * 
 * @module server/storage/factory
 */

import type { IStorage } from "../storage";
import { DatabaseStorage } from "../storage";

/**
 * Creates a storage instance based on STORAGE_PROVIDER environment variable.
 * 
 * Supported providers:
 * - "postgresql" (default): Uses Drizzle ORM with PostgreSQL
 * - Future: "pocketbase", "mock" (for testing), etc.
 * 
 * @returns An instance implementing IStorage interface
 * @throws Error if provider is not supported
 */
export function createStorage(): IStorage {
  const provider = process.env.STORAGE_PROVIDER || "postgresql";

  switch (provider.toLowerCase()) {
    case "postgresql":
    case "postgres":
      return new DatabaseStorage();
    
    // Future implementations:
    // case "pocketbase":
    //   return new PocketBaseStorage();
    // case "mock":
    //   return new MockStorage();
    
    default:
      console.warn(`Unknown STORAGE_PROVIDER: ${provider}. Falling back to postgresql.`);
      return new DatabaseStorage();
  }
}

/**
 * Singleton instance of the storage.
 * Use this throughout the application instead of creating new instances.
 * 
 * IMPORTANT: Never import `db` directly from "./db" outside of storage implementations.
 * Always use this `storage` instance to access data.
 */
export const storage = createStorage();

