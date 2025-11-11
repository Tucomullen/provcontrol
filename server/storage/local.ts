/**
 * Local File System Storage Provider
 * 
 * Stores files in the local filesystem under the uploads/ directory.
 * Suitable for development and small-scale deployments.
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import type { StorageProvider } from "./index";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class LocalStorageProvider implements StorageProvider {
  private uploadsDir: string;

  constructor() {
    // Get uploads directory from env or use default
    const customPath = process.env.STORAGE_LOCAL_PATH;
    if (customPath) {
      this.uploadsDir = path.isAbsolute(customPath)
        ? customPath
        : path.resolve(process.cwd(), customPath);
    } else {
      // Default to uploads/ in project root
      this.uploadsDir = path.resolve(__dirname, "..", "..", "uploads");
    }

    // Ensure uploads directory exists
    this.ensureDirectoryExists();
  }

  private ensureDirectoryExists(): void {
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  /**
   * Generate a unique file ID
   */
  private generateFileId(fileName: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const extension = this.getExtension(fileName);
    return `${timestamp}-${random}${extension ? `.${extension}` : ""}`;
  }

  /**
   * Extract file extension from filename
   */
  private getExtension(fileName: string): string {
    const ext = path.extname(fileName).toLowerCase().substring(1);
    // Normalize common extensions
    if (ext === "jpeg") return "jpg";
    return ext;
  }

  /**
   * Get MIME type from extension or content type
   */
  private getContentType(fileName: string, contentType?: string): string {
    if (contentType) return contentType;

    const ext = this.getExtension(fileName);
    const mimeTypes: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      webp: "image/webp",
      pdf: "application/pdf",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    };

    return mimeTypes[ext] || "application/octet-stream";
  }

  async upload(
    buffer: Buffer,
    fileName: string,
    contentType?: string
  ): Promise<string> {
    this.ensureDirectoryExists();

    const fileId = this.generateFileId(fileName);
    const filePath = path.join(this.uploadsDir, fileId);

    // Write file to disk
    await fs.promises.writeFile(filePath, buffer);

    // Return relative URL (will be served by Express static middleware)
    return `/uploads/${fileId}`;
  }

  async delete(fileId: string): Promise<void> {
    // Extract filename from URL if it's a full URL
    const fileName = fileId.startsWith("/uploads/")
      ? fileId.substring("/uploads/".length)
      : fileId;

    const filePath = path.join(this.uploadsDir, fileName);

    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  }

  getUrl(fileId: string): string {
    // If it's already a full URL, return as-is
    if (fileId.startsWith("http://") || fileId.startsWith("https://")) {
      return fileId;
    }

    // If it's already a relative path, return as-is
    if (fileId.startsWith("/uploads/")) {
      return fileId;
    }

    // Otherwise, assume it's a filename and construct the path
    return `/uploads/${fileId}`;
  }

  async exists(fileId: string): Promise<boolean> {
    const fileName = fileId.startsWith("/uploads/")
      ? fileId.substring("/uploads/".length)
      : fileId;

    const filePath = path.join(this.uploadsDir, fileName);
    return fs.existsSync(filePath);
  }
}

