/**
 * Storage Provider Abstraction
 * 
 * This module provides a unified interface for file storage that works
 * with both local filesystem and cloud storage (S3, R2, Wasabi).
 * 
 * To migrate from local to cloud, simply change STORAGE_PROVIDER env var.
 */

export interface StorageProvider {
  /**
   * Upload a file and return its public URL
   * @param buffer - File content as Buffer
   * @param fileName - Original filename (used for extension detection)
   * @param contentType - MIME type (optional, will be inferred if not provided)
   * @returns Promise resolving to public URL of the uploaded file
   */
  upload(buffer: Buffer, fileName: string, contentType?: string): Promise<string>;

  /**
   * Delete a file by its ID
   * @param fileId - File identifier (URL or key)
   * @returns Promise that resolves when file is deleted
   */
  delete(fileId: string): Promise<void>;

  /**
   * Get the public URL for a file
   * @param fileId - File identifier
   * @returns Public URL string
   */
  getUrl(fileId: string): string;

  /**
   * Check if a file exists
   * @param fileId - File identifier
   * @returns Promise resolving to true if file exists
   */
  exists(fileId: string): Promise<boolean>;
}

import { LocalStorageProvider } from "./local";
import { S3StorageProvider } from "./s3";

/**
 * Create a storage provider based on environment configuration
 */
export function createStorageProvider(): StorageProvider {
  const provider = process.env.STORAGE_PROVIDER || "local";

  switch (provider.toLowerCase()) {
    case "s3":
      return new S3StorageProvider();
    case "local":
    default:
      return new LocalStorageProvider();
  }
}

/**
 * Singleton instance of the storage provider
 * Use this throughout the application
 */
export const storage = createStorageProvider();

