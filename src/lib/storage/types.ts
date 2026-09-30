export interface UploadFileInput {
  file: Buffer | Blob;
  fileName: string;
  mimeType: string;
  folder: string; // e.g. "players/123/profile"
  bucket?: string;
}

export interface UploadResult {
  success: boolean;
  storagePath: string;
  publicUrl: string;
  fileSizeBytes: number;
  mimeType: string;
  error?: string;
}

export interface StorageService {
  uploadFile(input: UploadFileInput): Promise<UploadResult>;
  deleteFile(storagePath: string, bucket?: string): Promise<{ success: boolean; error?: string }>;
  getPublicUrl(storagePath: string, bucket?: string): string;
}
