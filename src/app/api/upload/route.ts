import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const type = (formData.get('type') as string) || 'avatar';

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    // Validate mime types based on type
    const imageMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    const videoMimes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska', 'video/ogg', 'video/mpeg'];

    const isVideo = type === 'video_feed' || file.type.startsWith('video/');

    if (isVideo) {
      if (!videoMimes.includes(file.type) && !file.type.startsWith('video/')) {
        return NextResponse.json(
          { success: false, error: 'Invalid video format. Please upload MP4, WEBM, or MOV video.' },
          { status: 400 }
        );
      }
    } else {
      if (!imageMimes.includes(file.type) && !file.type.startsWith('image/')) {
        return NextResponse.json(
          { success: false, error: 'Invalid file type. Please upload PNG, JPG, WEBP, or GIF.' },
          { status: 400 }
        );
      }
    }

    // Limit to 50MB
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds 50MB maximum limit.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let subfolder = 'avatars';
    if (type === 'cover') subfolder = 'covers';
    else if (type === 'photo_feed') subfolder = 'feed_photos';
    else if (type === 'video_feed') subfolder = 'feed_videos';

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', subfolder);
    await mkdir(uploadDir, { recursive: true });

    const ext = path.extname(file.name) || (isVideo ? '.mp4' : file.type === 'image/png' ? '.png' : '.jpg');
    const safeBaseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueFileName = `${Date.now()}-${safeBaseName}${ext}`;
    const filePath = path.join(uploadDir, uniqueFileName);

    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${subfolder}/${uniqueFileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
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
