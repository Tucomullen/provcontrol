/**
 * S3-Compatible Storage Provider
 * 
 * Supports AWS S3, Cloudflare R2, Wasabi, and any S3-compatible service.
 * Configure via environment variables.
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import type { StorageProvider } from "./index";

export class S3StorageProvider implements StorageProvider {
  private client: S3Client;
  private bucket: string;
  private region: string;
  private cdnUrl?: string;
  private usePublicUrls: boolean;

  constructor() {
    // Validate required environment variables
    const bucket = process.env.S3_BUCKET;
    const region = process.env.S3_REGION || "us-east-1";
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const endpoint = process.env.S3_ENDPOINT; // For R2, Wasabi, etc.
    const cdnUrl = process.env.S3_CDN_URL;

    if (!bucket) {
      throw new Error("S3_BUCKET environment variable is required");
    }

    if (!accessKeyId || !secretAccessKey) {
      throw new Error(
        "AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables are required"
      );
    }

    this.bucket = bucket;
    this.region = region;
    this.cdnUrl = cdnUrl;

    // Configure S3 client
    const clientConfig: any = {
      region: this.region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    };

    // Add custom endpoint for R2, Wasabi, etc.
    if (endpoint) {
      clientConfig.endpoint = endpoint;
      // For non-AWS endpoints, we might need to disable SSL verification
      // or configure differently. Adjust based on your provider.
    }

    this.client = new S3Client(clientConfig);

    // Use public URLs if CDN is configured, otherwise use pre-signed URLs
    this.usePublicUrls = !!this.cdnUrl;
  }

  /**
   * Generate a unique file key (S3 object key)
   */
  private generateFileKey(fileName: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const extension = this.getExtension(fileName);
    const key = `${timestamp}-${random}${extension ? `.${extension}` : ""}`;
    
    // Optionally add a prefix (e.g., "uploads/") for organization
    const prefix = process.env.S3_KEY_PREFIX || "";
    return prefix ? `${prefix}${key}` : key;
  }

  /**
   * Extract file extension from filename
   */
  private getExtension(fileName: string): string {
    const ext = fileName.split(".").pop()?.toLowerCase() || "";
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
    const key = this.generateFileKey(fileName);
    const mimeType = this.getContentType(fileName, contentType);

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
      // Make object publicly readable if using public URLs
      ...(this.usePublicUrls && {
        ACL: "public-read",
      }),
    });

    await this.client.send(command);

    // Return public URL
    return this.getUrl(key);
  }

  async delete(fileId: string): Promise<void> {
    // Extract key from URL if it's a full URL
    const key = this.extractKeyFromUrl(fileId);

    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.client.send(command);
  }

  getUrl(fileId: string): string {
    const key = this.extractKeyFromUrl(fileId);

    // If CDN URL is configured, use it
    if (this.cdnUrl) {
      return `${this.cdnUrl}/${key}`;
    }

    // If using public URLs, construct S3 public URL
    if (this.usePublicUrls) {
      const endpoint = process.env.S3_ENDPOINT;
      if (endpoint) {
        // Custom endpoint (R2, Wasabi, etc.)
        return `${endpoint}/${this.bucket}/${key}`;
      }
      // Standard S3 public URL
      return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
    }

    // Otherwise, return the key (will need to generate pre-signed URL when accessing)
    // For now, we'll generate a pre-signed URL that expires in 1 hour
    // In production, you might want to generate these on-demand
    return key;
  }

  /**
   * Generate a pre-signed URL for private objects
   * This is useful when objects are not publicly accessible
   */
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return await getSignedUrl(this.client, command, { expiresIn });
  }

  async exists(fileId: string): Promise<boolean> {
    const key = this.extractKeyFromUrl(fileId);

    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.client.send(command);
      return true;
    } catch (error: any) {
      if (error.name === "NotFound" || error.$metadata?.httpStatusCode === 404) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Extract S3 key from URL or return as-is if already a key
   */
  private extractKeyFromUrl(fileId: string): string {
    // If it's a full URL, extract the key
    if (fileId.startsWith("http://") || fileId.startsWith("https://")) {
      // Remove protocol, domain, bucket, etc.
      const url = new URL(fileId);
      // Key is everything after the bucket name in the path
      return url.pathname.startsWith("/") ? url.pathname.substring(1) : url.pathname;
    }

    // If it starts with /uploads/, remove that prefix (legacy local storage format)
    if (fileId.startsWith("/uploads/")) {
      return fileId.substring("/uploads/".length);
    }

    // Otherwise, assume it's already a key
    return fileId;
  }
}

