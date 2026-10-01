import { createClient } from '@supabase/supabase-js';
import { StorageService, UploadFileInput, UploadResult } from './types';

const DEFAULT_BUCKET = 'MobileRoster-media';

class SupabaseStorageService implements StorageService {
  private getClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Supabase storage requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
    }
    return createClient(supabaseUrl, serviceRoleKey);
  }

  async uploadFile(input: UploadFileInput): Promise<UploadResult> {
    const bucket = input.bucket || DEFAULT_BUCKET;
    const cleanFileName = input.fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fullPath = `${input.folder.replace(/^\/|\/$/g, '')}/${Date.now()}-${cleanFileName}`;

    try {
      const supabase = this.getClient();
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fullPath, input.file, {
          contentType: input.mimeType,
          upsert: true,
        });

      if (error) {
        console.error('Supabase storage upload error:', error);
        return {
          success: false,
          storagePath: '',
          publicUrl: '',
          fileSizeBytes: 0,
          mimeType: input.mimeType,
          error: error.message,
        };
      }

      const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(data.path);

      return {
        success: true,
        storagePath: data.path,
        publicUrl: publicUrlData.publicUrl,
        fileSizeBytes: Buffer.isBuffer(input.file) ? input.file.length : 0,
        mimeType: input.mimeType,
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown storage error';
      return {
        success: false,
        storagePath: '',
        publicUrl: '',
        fileSizeBytes: 0,
        mimeType: input.mimeType,
        error: errorMessage,
      };
    }
  }

  async deleteFile(storagePath: string, bucket = DEFAULT_BUCKET): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = this.getClient();
      const { error } = await supabase.storage.from(bucket).remove([storagePath]);
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to delete file' };
    }
  }

  getPublicUrl(storagePath: string, bucket = DEFAULT_BUCKET): string {
    const supabase = this.getClient();
    const { data } = supabase.storage.from(bucket).getPublicUrl(storagePath);
    return data.publicUrl;
  }
}

export const storage: StorageService = new SupabaseStorageService();
