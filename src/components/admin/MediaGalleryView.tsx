'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Image as ImageIcon,
  Video,
  Play,
  Search,
  ExternalLink,
  Calendar,
  User,
  X,
  Maximize2,
  Film,
  Sparkles,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export interface MediaItem {
  id: string;
  mediaType: 'IMAGE' | 'VIDEO_CLIP' | 'VIDEO_EMBED' | 'PDF_DOCUMENT';
  publicUrl: string;
  fileName: string;
  caption?: string | null;
  durationSeconds?: number | null;
  fileSizeBytes?: number;
  createdAt: Date | string;
  player?: {
    id: string;
    slug: string;
    ign: string;
    displayName?: string | null;
    avatarUrl?: string | null;
    primaryRole?: string;
  } | null;
}

interface MediaGalleryViewProps {
  initialMedia: MediaItem[];
}

export const MediaGalleryView: React.FC<MediaGalleryViewProps> = ({ initialMedia }) => {
  const [filter, setFilter] = React.useState<'ALL' | 'IMAGE' | 'VIDEO_CLIP'>('ALL');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);

  const photos = initialMedia.filter((m) => m.mediaType === 'IMAGE');
  const videos = initialMedia.filter((m) => m.mediaType === 'VIDEO_CLIP');

  const filteredMedia = initialMedia.filter((item) => {
    // Type Filter
    if (filter === 'IMAGE' && item.mediaType !== 'IMAGE') return false;
    if (filter === 'VIDEO_CLIP' && item.mediaType !== 'VIDEO_CLIP') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const ignMatch = item.player?.ign.toLowerCase().includes(q);
      const nameMatch = item.player?.displayName?.toLowerCase().includes(q);
      const captionMatch = item.caption?.toLowerCase().includes(q);
      const fileMatch = item.fileName.toLowerCase().includes(q);
      return ignMatch || nameMatch || captionMatch || fileMatch;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Controls Bar: Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#141414] border border-[#2A2A2A] p-3 sm:p-4 rounded-[2px]">
        {/* Tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-[2px] font-display text-xs uppercase tracking-wider font-semibold transition-colors ${
              filter === 'ALL'
                ? 'bg-[#FFE93B] text-black font-bold'
                : 'bg-[#1F1F1F] text-[#ADABAB] hover:text-white hover:bg-[#2A2A2A]'
            }`}
          >
            All Media ({initialMedia.length})
          </button>
          <button
            onClick={() => setFilter('IMAGE')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-[2px] font-display text-xs uppercase tracking-wider font-semibold transition-colors ${
              filter === 'IMAGE'
                ? 'bg-[#FFE93B] text-black font-bold'
                : 'bg-[#1F1F1F] text-[#ADABAB] hover:text-white hover:bg-[#2A2A2A]'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Photos ({photos.length})
          </button>
          <button
            onClick={() => setFilter('VIDEO_CLIP')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-[2px] font-display text-xs uppercase tracking-wider font-semibold transition-colors ${
              filter === 'VIDEO_CLIP'
                ? 'bg-[#FFE93B] text-black font-bold'
                : 'bg-[#1F1F1F] text-[#ADABAB] hover:text-white hover:bg-[#2A2A2A]'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            60s Clips ({videos.length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#837D72] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by player IGN or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1F1F1F] border border-[#2A2A2A] rounded-[2px] pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-[#837D72] focus:outline-none focus:border-[#FFE93B] transition-colors"
          />
        </div>
      </div>

      {/* Media Grid */}
      {filteredMedia.length === 0 ? (
        <div className="p-12 text-center bg-[#141414] border border-[#2A2A2A] rounded-[2px] space-y-4">
          <div className="w-16 h-16 bg-[#1F1F1F] border border-[#2A2A2A] rounded-full flex items-center justify-center mx-auto text-[#FFE93B]">
            <Film className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="font-display font-black text-lg text-white uppercase">
              No Media Uploads Found
            </h3>
            <p className="text-xs text-[#837D72] leading-relaxed">
              When verified players log in to their studio (/player) and upload up to 5 landscape photos and 2 gameplay clips (60s max), their media will automatically appear in this central gallery.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMedia.map((item) => {
            const isVideo = item.mediaType === 'VIDEO_CLIP';
            const formattedDate = new Date(item.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });

            return (
              <div
                key={item.id}
                className="bg-[#141414] border border-[#2A2A2A] hover:border-[#FFE93B]/40 rounded-[2px] overflow-hidden flex flex-col justify-between transition-all group shadow-lg"
              >
                {/* Card Header: Player Details */}
                <div className="p-3.5 border-b border-[#2A2A2A] flex items-center justify-between bg-[#191919]">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-[#2A2A2A] overflow-hidden flex-shrink-0 flex items-center justify-center text-xs font-bold text-[#FFE93B] border border-[#3A3A3A]">
                      {item.player?.avatarUrl ? (
                        <img
                          src={item.player.avatarUrl}
                          alt={item.player.ign}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        item.player?.ign?.charAt(0).toUpperCase() || 'P'
                      )}
                    </div>
                    <div className="min-w-0">
                      {item.player ? (
                        <Link
                          href={`/players/${item.player.slug}`}
                          target="_blank"
                          className="font-display font-bold text-xs text-white hover:text-[#FFE93B] transition-colors truncate block"
                        >
                          {item.player.ign}
                        </Link>
                      ) : (
                        <span className="font-display font-bold text-xs text-[#ADABAB]">
                          Community Player
                        </span>
                      )}
                      {item.player?.primaryRole && (
                        <span className="text-[10px] text-[#837D72] font-mono uppercase block -mt-0.5">
                          {item.player.primaryRole}
                        </span>
                      )}
                    </div>
                  </div>

                  <Badge
                    variant={isVideo ? 'warning' : 'primary'}
                    className="text-[9px] uppercase tracking-widest font-mono"
                  >
                    {isVideo ? '60s Clip' : 'Photo'}
                  </Badge>
                </div>

                {/* Media Container (16:9 Landscape) */}
                <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                  {isVideo ? (
                    <video
                      src={item.publicUrl}
                      controls
                      preload="metadata"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div
                      className="w-full h-full relative cursor-pointer group/img"
                      onClick={() => setSelectedImage(item.publicUrl)}
                    >
                      <img
                        src={item.publicUrl}
                        alt={item.caption || item.fileName}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="p-2 rounded-full bg-black/80 text-[#FFE93B] border border-[#FFE93B]/40">
                          <Maximize2 className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer: Metadata & Actions */}
                <div className="p-3.5 space-y-3 bg-[#141414] border-t border-[#2A2A2A]">
                  <div className="flex items-center justify-between text-[11px] text-[#837D72]">
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar className="w-3 h-3 text-[#FFE93B]" />
                      {formattedDate}
                    </span>
                    {item.player && (
                      <Link
                        href={`/players/${item.player.slug}`}
                        target="_blank"
                        className="flex items-center gap-1 text-[#FFE93B] hover:underline font-display text-[10px] uppercase font-semibold"
                      >
                        Public Profile
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                  </div>

                  {item.caption && (
                    <p className="text-xs text-[#ADABAB] line-clamp-2 italic leading-relaxed">
                      &ldquo;{item.caption}&rdquo;
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white hover:text-[#FFE93B] p-2 bg-black/60 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="relative max-w-5xl max-h-[85vh] overflow-hidden rounded-[2px] border-2 border-[#FFE93B]">
            <img
              src={selectedImage}
              alt="Player Highlight Preview"
              className="w-full h-full object-contain max-h-[85vh]"
            />
          </div>
        </div>
      )}
    </div>
  );
};
