import { createClient } from './client';

export type BuketName = 'store-assets' | 'product-images';

/**
 * Uploads a raw browser File to Supabase Storage using the active session.
 * @param file The browser `File` object from an `<input type="file">`.
 * @param bucket The Supabase Storage bucket name (e.g. 'store-assets').
 * @param userId The authenticated user's ID for folder scoping.
 * @returns The public URL of the uploaded file.
 */
export async function uploadFileToSupabase(
  file: File,
  bucket: BuketName,
  userId: string
): Promise<string> {
  const supabase = createClient();
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
  const filePath = `${userId}/${fileName}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload ${file.name}: ${error.message}`);
  }

  // Get public URL immediately
  const { data: publicUrlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}
