import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { getPlayerSession } from '@/server/actions/player-auth';
import { getAdminSession } from '@/server/actions/admin-auth';
import { rateLimit } from '@/lib/auth/rate-limit';

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

// Allowed MIME types mapped to a server-chosen extension (client filename/extension is never trusted).
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
      return startsWith(buf, [0x66, 0x74, 0x79, 0x70], 4); // "ftyp"
    case 'video/webm':
      return startsWith(buf, [0x1a, 0x45, 0xdf, 0xa3]);
    default:
      return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const [player, admin] = await Promise.all([getPlayerSession(), getAdminSession()]);
    const identity = player?.email || admin?.email;
    if (!identity) {
      return NextResponse.json({ success: false, error: 'Authentication required.' }, { status: 401 });
    }

    if (!rateLimit(`upload:${identity}`, 30, 10 * 60 * 1000)) {
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

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', subfolder);
    await mkdir(uploadDir, { recursive: true });

    const uniqueFileName = `${randomUUID()}${ext}`;
    await writeFile(path.join(uploadDir, uniqueFileName), buffer);

    return NextResponse.json({
      success: true,
      url: `/uploads/${subfolder}/${uniqueFileName}`,
      fileName: uniqueFileName,
      mediaType: isVideo ? 'VIDEO' : 'IMAGE',
    });
  } catch (error) {
    console.error('[UPLOAD API ERROR]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload media. Please try again.' },
      { status: 500 }
    );
  }
}
