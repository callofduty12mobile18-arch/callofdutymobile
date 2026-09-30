import * as React from 'react';
import { Image as ImageIcon, Video, Film, Users, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getAllPlayerMedia } from '@/server/queries/media';
import { MediaGalleryView } from '@/components/admin/MediaGalleryView';

export default async function AdminMediaPage() {
  const media = await getAllPlayerMedia();

  const totalPhotos = media.filter((m) => m.mediaType === 'IMAGE').length;
  const totalVideos = media.filter((m) => m.mediaType === 'VIDEO_CLIP').length;
  const uniquePlayersCount = new Set(media.map((m) => m.playerId).filter(Boolean)).size;

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A2A2A] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-display tracking-widest text-[#FFE93B] uppercase mb-1">
            <Film className="w-4 h-4" />
            <span>CENTRAL ARCHIVE</span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-tight">
            MEDIA LIBRARY & HIGHLIGHTS FEED
          </h1>
          <p className="text-xs text-[#ADABAB] mt-1">
            Real-time feed of all 16:9 landscape photos (up to 5) and 60-second gameplay video clips uploaded by players in their profile feeds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="primary" className="text-xs px-3 py-1">
            {media.length} TOTAL MEDIA ASSETS
          </Badge>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="elevated">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#837D72] font-display uppercase tracking-wider block">
                Total Media
              </span>
              <span className="font-display font-black text-2xl text-white mt-0.5 block">
                {media.length}
              </span>
            </div>
            <div className="w-9 h-9 rounded-[2px] bg-[#FFE93B]/10 border border-[#FFE93B]/30 flex items-center justify-center text-[#FFE93B]">
              <Film className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#837D72] font-display uppercase tracking-wider block">
                Landscape Photos
              </span>
              <span className="font-display font-black text-2xl text-[#FFE93B] mt-0.5 block">
                {totalPhotos}
              </span>
            </div>
            <div className="w-9 h-9 rounded-[2px] bg-[#1F1F1F] border border-[#2A2A2A] flex items-center justify-center text-[#FFE93B]">
              <ImageIcon className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#837D72] font-display uppercase tracking-wider block">
                60s Video Clips
              </span>
              <span className="font-display font-black text-2xl text-cyan-400 mt-0.5 block">
                {totalVideos}
              </span>
            </div>
            <div className="w-9 h-9 rounded-[2px] bg-[#1F1F1F] border border-[#2A2A2A] flex items-center justify-center text-cyan-400">
              <Video className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#837D72] font-display uppercase tracking-wider block">
                Active Contributors
              </span>
              <span className="font-display font-black text-2xl text-white mt-0.5 block">
                {uniquePlayersCount}
              </span>
            </div>
            <div className="w-9 h-9 rounded-[2px] bg-[#1F1F1F] border border-[#2A2A2A] flex items-center justify-center text-white">
              <Users className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gallery & Feed View */}
      <MediaGalleryView initialMedia={media as any} />
    </div>
  );
}
