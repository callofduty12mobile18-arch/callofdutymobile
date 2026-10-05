'use client';

import * as React from 'react';
import { Camera, Video, Maximize2, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface MediaItem {
  id: string;
  mediaType: string;
  publicUrl: string;
  caption?: string | null;
  fileName?: string;
}

interface PlayerMediaGalleryProps {
  media: MediaItem[];
  playerIgn: string;
}

export const PlayerMediaGallery: React.FC<PlayerMediaGalleryProps> = ({
  media,
  playerIgn,
}) => {
  const photos = media.filter((m) => m.mediaType === 'IMAGE');
  const videos = media.filter((m) => m.mediaType === 'VIDEO_CLIP');

  const [activePhotoIndex, setActivePhotoIndex] = React.useState<number | null>(null);

  // Handle keyboard navigation for lightbox
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activePhotoIndex === null) return;

      if (e.key === 'Escape') {
        setActivePhotoIndex(null);
      } else if (e.key === 'ArrowRight' && photos.length > 1) {
        setActivePhotoIndex((prev) => (prev !== null ? (prev + 1) % photos.length : 0));
      } else if (e.key === 'ArrowLeft' && photos.length > 1) {
        setActivePhotoIndex((prev) =>
          prev !== null ? (prev - 1 + photos.length) % photos.length : 0
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePhotoIndex, photos.length]);

  return (
    <div className="space-y-6">
      {/* 1. 60-Second Video Clips */}
      {videos.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-display uppercase text-xs text-white font-bold tracking-wider flex items-center gap-1.5">
            <Video className="w-3.5 h-3.5 text-cyan-400" /> Gameplay Video Highlights (60s Max)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {videos.map((video) => (
              <div
                key={video.id}
                className="space-y-1.5 p-2 bg-[#1F1F1F] border border-[#2A2A2A] rounded-[2px]"
              >
                <div className="relative aspect-video rounded-[2px] bg-black overflow-hidden">
                  <video
                    src={video.publicUrl}
                    controls
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="text-[11px] text-[#ADABAB] font-display uppercase tracking-wider truncate px-1">
                  {video.caption || 'Gameplay Highlight Clip'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Photos Gallery with Click-to-Preview Lightbox */}
      {photos.length > 0 && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
            <h4 className="font-display uppercase text-xs text-white font-bold tracking-wider flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-[#FFE93B]" /> Photos Gallery ({photos.length})
            </h4>
            <span className="text-[10px] text-[#837D72] font-mono uppercase">
              Click any photo to preview full size
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {photos.map((photo, idx) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => setActivePhotoIndex(idx)}
                className="relative aspect-video rounded-[2px] bg-[#1F1F1F] border border-[#2A2A2A] hover:border-[#FFE93B] overflow-hidden group shadow-md text-left transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FFE93B]"
              >
                <img
                  src={photo.publicUrl}
                  alt={photo.caption || playerIgn}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* Hover overlay with zoom icon */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2.5">
                  <div className="self-end p-1.5 rounded-full bg-black/80 text-[#FFE93B] border border-[#FFE93B]/40">
                    <Maximize2 className="w-3.5 h-3.5" />
                  </div>
                  {photo.caption && (
                    <span className="text-[11px] text-white font-medium truncate bg-black/60 px-2 py-1 rounded-[2px]">
                      {photo.caption}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. Fullscreen Lightbox Modal */}
      {activePhotoIndex !== null && photos[activePhotoIndex] && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setActivePhotoIndex(null)}
        >
          {/* Close Button */}
          <button
            onClick={() => setActivePhotoIndex(null)}
            className="absolute top-3 right-3 sm:top-5 sm:right-5 z-50 text-white hover:text-[#FFE93B] p-2 sm:p-2.5 bg-black/70 border border-[#2A2A2A] hover:border-[#FFE93B] rounded-full transition-colors"
            aria-label="Close Preview"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Navigation: Previous Photo */}
          {photos.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActivePhotoIndex((prev) =>
                  prev !== null ? (prev - 1 + photos.length) % photos.length : 0
                );
              }}
              className="absolute left-2 sm:left-4 z-50 p-2 sm:p-3 bg-black/80 border border-[#2A2A2A] text-white hover:text-[#FFE93B] hover:border-[#FFE93B] rounded-full transition-all"
              aria-label="Previous Photo"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}

          {/* Navigation: Next Photo */}
          {photos.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActivePhotoIndex((prev) =>
                  prev !== null ? (prev + 1) % photos.length : 0
                );
              }}
              className="absolute right-2 sm:right-4 z-50 p-2 sm:p-3 bg-black/80 border border-[#2A2A2A] text-white hover:text-[#FFE93B] hover:border-[#FFE93B] rounded-full transition-all"
              aria-label="Next Photo"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}

          {/* Main Image Container */}
          <div
            className="relative max-w-5xl max-h-[90vh] flex flex-col items-center justify-center p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative rounded-[3px] border-2 border-[#FFE93B] overflow-hidden bg-black shadow-[0_0_50px_rgba(255,233,59,0.25)]">
              <img
                src={photos[activePhotoIndex].publicUrl}
                alt={photos[activePhotoIndex].caption || `${playerIgn} highlight`}
                className="max-h-[75vh] w-auto max-w-full object-contain"
              />
            </div>

            {/* Caption & Counter */}
            <div className="mt-3 flex items-center justify-between w-full max-w-2xl px-2 text-xs text-[#ADABAB]">
              <span className="font-display uppercase tracking-wider text-white font-semibold">
                {photos[activePhotoIndex].caption || `${playerIgn} Photo #${activePhotoIndex + 1}`}
              </span>
              <span className="font-mono text-[#FFE93B]">
                {activePhotoIndex + 1} / {photos.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
