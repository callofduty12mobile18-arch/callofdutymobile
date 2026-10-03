import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { getPlayerSession } from '@/server/actions/player-auth';
import { getAdminSession } from '@/server/actions/admin-auth';
import { rateLimit } from '@/lib/auth/rate-limit';

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

const IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};
const VIDEO_TYPES: Record<string, string> = {
  'video/mp4': '.mp4',
  'video/webm': '.webm',
  'video/quicktime': '.mov',
};

const SUBFOLDERS: Record<string, string> = {
  avatar: 'avatars',
  cover: 'covers',
  photo_feed: 'feed_photos',
  video_feed: 'feed_videos',
};

function startsWith(buf: Buffer, bytes: number[], offset = 0): boolean {
  return bytes.every((b, i) => buf[offset + i] === b);
}

/** Verify the file's magic bytes match its declared MIME type. */
function signatureMatches(mime: string, buf: Buffer): boolean {
  switch (mime) {
    case 'image/jpeg':
      return startsWith(buf, [0xff, 0xd8, 0xff]);
    case 'image/png':
      return startsWith(buf, [0x89, 0x50, 0x4e, 0x47]);
    case 'image/gif':
      return startsWith(buf, [0x47, 0x49, 0x46, 0x38]);
    case 'image/webp':
      return startsWith(buf, [0x52, 0x49, 0x46, 0x46]) && startsWith(buf, [0x57, 0x45, 0x42, 0x50], 8);
    case 'video/mp4':
    case 'video/quicktime':
      return startsWith(buf, [0x66, 0x74, 0x79, 0x70], 4);
    case 'video/webm':
      return startsWith(buf, [0x1a, 0x45, 0xdf, 0xa3]);
    default:
      return false;
  }
}

async function uploadToSupabaseStorage(
  subfolder: string,
  fileName: string,
  buffer: Buffer,
  mimeType: string
): Promise<string | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const bucket = 'media';

    // Attempt upload
    const filePath = `${subfolder}/${fileName}`;
    const { error } = await supabase.storage.from(bucket).upload(filePath, buffer, {
      contentType: mimeType,
      upsert: true,
    });

    if (error) {
      // If bucket doesn't exist, create it and retry once
      if (error.message.includes('not found') || error.message.includes('Bucket')) {
        await supabase.storage.createBucket(bucket, { public: true });
        const retry = await supabase.storage.from(bucket).upload(filePath, buffer, {
          contentType: mimeType,
          upsert: true,
        });
        if (retry.error) {
          console.warn('[SUPABASE STORAGE RETRY ERROR]:', retry.error);
          return null;
        }
      } else {
        console.warn('[SUPABASE STORAGE ERROR]:', error);
        return null;
      }
    }

    const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return publicData.publicUrl || null;
  } catch (err) {
    console.warn('[SUPABASE STORAGE EXCEPTION]:', err);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const [player, admin] = await Promise.all([getPlayerSession(), getAdminSession()]);
    const identity = player?.email || admin?.email;
    if (!identity) {
      return NextResponse.json({ success: false, error: 'Authentication required. Please log in.' }, { status: 401 });
    }

    const isWithinRateLimit = await rateLimit(`upload:${identity}`, 60, 10 * 60 * 1000);
    if (!isWithinRateLimit) {
      return NextResponse.json({ success: false, error: 'Too many uploads. Try again later.' }, { status: 429 });
    }

    const formData = await req.formData();
    const file = formData.get('file');
    const type = (formData.get('type') as string) || 'avatar';

    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    const subfolder = SUBFOLDERS[type];
    if (!subfolder) {
      return NextResponse.json({ success: false, error: 'Invalid upload type.' }, { status: 400 });
    }

    const isVideo = type === 'video_feed';
    const allowed = isVideo ? VIDEO_TYPES : IMAGE_TYPES;
    const ext = allowed[file.type];
    if (!ext) {
      return NextResponse.json(
        {
          success: false,
          error: isVideo
            ? 'Invalid video format. Please upload MP4, WEBM, or MOV video.'
            : 'Invalid file type. Please upload PNG, JPG, WEBP, or GIF.',
        },
        { status: 400 }
      );
    }

    if (file.size > (isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES)) {
      return NextResponse.json(
        { success: false, error: `File size exceeds ${isVideo ? 50 : 10}MB maximum limit.` },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (!signatureMatches(file.type, buffer)) {
      return NextResponse.json({ success: false, error: 'File content does not match its type.' }, { status: 400 });
    }

    const uniqueFileName = `${randomUUID()}${ext}`;

    // 1. Try Supabase Storage first (Persistent Cloud CDN)
    const supabasePublicUrl = await uploadToSupabaseStorage(subfolder, uniqueFileName, buffer, file.type);
    if (supabasePublicUrl) {
      return NextResponse.json({
        success: true,
        url: supabasePublicUrl,
        fileName: uniqueFileName,
        mediaType: isVideo ? 'VIDEO' : 'IMAGE',
      });
    }

    // 2. Try writing to local filesystem (works on local machine / non-read-only environments)
    try {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', subfolder);
      await mkdir(uploadDir, { recursive: true });
      await writeFile(path.join(uploadDir, uniqueFileName), buffer);

      return NextResponse.json({
        success: true,
        url: `/uploads/${subfolder}/${uniqueFileName}`,
        fileName: uniqueFileName,
        mediaType: isVideo ? 'VIDEO' : 'IMAGE',
      });
    } catch (fsErr) {
      console.warn('[LOCAL FS WRITE FAILED, USING INLINE FALLBACK]:', fsErr);

      // 3. Resilient fallback for serverless environments (Vercel read-only filesystem)
      if (!isVideo) {
        const base64Data = buffer.toString('base64');
        const dataUri = `data:${file.type};base64,${base64Data}`;
        return NextResponse.json({
          success: true,
          url: dataUri,
          fileName: uniqueFileName,
          mediaType: 'IMAGE',
        });
      }

      throw fsErr;
    }
  } catch (error) {
    console.error('[UPLOAD API ERROR]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload media. Please try again.' },
      { status: 500 }
    );
  }
}
