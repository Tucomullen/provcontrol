/**
 * Data Storage Abstraction
 * 
 * This module re-exports the storage factory and interface.
 * Import from here: `import { storage } from "./storage/data-storage"`
 * 
 * This abstraction layer allows switching database backends without
 * changing application code. The factory pattern enables:
 * - Easy migration between PostgreSQL, PocketBase, etc.
 * - Mock implementations for testing
 * - Consistent interface across all storage backends
 * 
 * @module server/storage/data-storage
 */

export type { IStorage } from "../storage";
export { DatabaseStorage } from "../storage";
export { storage, createStorage } from "./factory";

