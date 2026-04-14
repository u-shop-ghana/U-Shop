import { Buffer } from 'node:buffer';
import { supabaseAdmin } from '../lib/supabase';
import { logger } from '../lib/logger';

// ─── Storage Service ──────────────────────────────────────────
// Handles interactions with Supabase Storage buckets such as
// uploading files, retrieving public URLs, generating signed URLs,
// and deleting files.
//
// Buckets configuration as per infrastructure.md:
// - product-images: Public (Returns public URLs)
// - store-assets: Public (Returns public URLs)
// - user-avatars: Public (Returns public URLs)
// - verification-docs: Private (Requires signed URLs)
// - dispute-evidence: Private (Requires signed URLs)
// - message-attachments: Private (Requires signed URLs)

export class StorageService {
  /**
   * Upload a file buffer to a specific Supabase Storage bucket.
   *
   * @param bucket The name of the target bucket
   * @param path The file path (e.g. 'listings/item1/photo.webp')
   * @param fileBuffer The file content buffer
   * @param contentType The MIME type of the file
   * @returns The generated path of the uploaded file
   */
  static async uploadFile(
    bucket: string,
    path: string,
    fileBuffer: Buffer,
    contentType: string
  ): Promise<string> {
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(path, fileBuffer, {
        contentType,
        upsert: true, // Overwrite if exists
      });

    if (error) {
      logger.error({ bucket, path, error }, 'Failed to upload file to Supabase Storage');
      throw new Error(`Upload failed for bucket ${bucket}: ${error.message}`);
    }

    return data.path;
  }

  /**
   * Retrieves a public URL for a file in a public bucket.
   *
   * @param bucket The public bucket name (e.g., 'product-images')
   * @param path The file path
   * @param transform Optional transformations (width, quality)
   * @returns The public URL string
   */
  static getPublicUrl(
    bucket: string,
    path: string,
    transform?: { width?: number; height?: number; quality?: number }
  ): string {
    const { data } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(path, { transform });

    return data.publicUrl;
  }

  /**
   * Generates a time-limited signed URL to securely access files in a private bucket.
   *
   * @param bucket The private bucket name (e.g., 'verification-docs')
   * @param path The file path
   * @param expiresIn Expiration time in seconds (Default: 3600 = 1 hour)
   * @returns The signed URL string
   */
  static async getSignedUrl(
    bucket: string,
    path: string,
    expiresIn = 3600
  ): Promise<string> {
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) {
      logger.error({ bucket, path, error }, 'Failed to generate signed URL');
      throw new Error(`Could not generate signed URL for bucket ${bucket}: ${error.message}`);
    }

    return data.signedUrl;
  }

  /**
   * Deletes files from a Supabase Storage bucket.
   *
   * @param bucket The bucket name
   * @param paths Array of file paths to delete
   */
  static async deleteFiles(bucket: string, paths: string[]): Promise<void> {
    if (!paths.length) return;

    const { error } = await supabaseAdmin.storage
      .from(bucket)
      .remove(paths);

    if (error) {
      logger.error({ bucket, paths, error }, 'Failed to delete files from Supabase Storage');
      throw new Error(`Deletion failed for bucket ${bucket}: ${error.message}`);
    }

    logger.info({ bucket, paths }, 'Successfully deleted storage files');
  }
}
