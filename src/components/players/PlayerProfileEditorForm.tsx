'use client';

import * as React from 'react';
import { useActionState, useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  User,
  Shield,
  Trophy,
  Save,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Share2,
  Upload,
  Camera,
  ImageIcon,
  Trash2,
  Loader2,
  Video,
  Film,
  Plus,
  Play,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { updatePlayerSelfProfile } from '@/server/actions/player-auth';
import { INDIAN_STATES } from '@/lib/constants/states';

export const JOINED_YEARS = ['2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026'] as const;

interface InitialData {
  ign: string;
  displayName: string;
  realName: string;
  primaryRole: string;
  state: string;
  city?: string;
  MobileRosterUid?: string;
  joinedYear?: string;
  avatarUrl?: string;
  coverImageUrl?: string;
  teamName: string;
  teamTag: string;
  bio: string;
  competitiveHistory?: string;
  photoFeed?: string[];
  videoFeed?: string[];
  youtubeUrl: string;
  instagramUrl: string;
  twitterUrl: string;
  seoKeywords?: string;
  seoDescription?: string;
  slug: string;
}

const ROLES = [
  { value: 'ENTRY_FRAGGER', label: 'Entry Fragger' },
  { value: 'FRAGGER_SLAYER', label: 'Fragger / Slayer' },
  { value: 'ANCHOR', label: 'Anchor' },
  { value: 'SCOUT_RECON', label: 'Scout / Recon' },
  { value: 'SUPPORT', label: 'Support' },
  { value: 'IGL', label: 'IGL (In-Game Leader)' },
  { value: 'OVERWATCH', label: 'Overwatch' },
  { value: 'RUSHER', label: 'Rusher' },
  { value: 'FLANKER', label: 'Flanker' },
  { value: 'MEDIC_REVIVER', label: 'Medic / Reviver' },
  { value: 'OBJECTIVE_PLAYER', label: 'Objective Player' },
];

export const PlayerProfileEditorForm: React.FC<{ initialData: InitialData }> = ({
  initialData,
}) => {
  const [state, formAction, isPending] = useActionState(updatePlayerSelfProfile, null);

  const [avatarUrl, setAvatarUrl] = useState<string>(initialData.avatarUrl || '');
  const [coverImageUrl, setCoverImageUrl] = useState<string>(initialData.coverImageUrl || '');
  const [photoFeed, setPhotoFeed] = useState<string[]>(initialData.photoFeed || []);
  const [videoFeed, setVideoFeed] = useState<string[]>(initialData.videoFeed || []);

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingPhotoFeed, setIsUploadingPhotoFeed] = useState(false);
  const [isUploadingVideoFeed, setIsUploadingVideoFeed] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const photoFeedInputRef = useRef<HTMLInputElement>(null);
  const videoFeedInputRef = useRef<HTMLInputElement>(null);

  const activeSlug = state?.slug || initialData.slug;

  useEffect(() => {
    if (state) {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  }, [state]);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'avatar' | 'cover'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    if (type === 'avatar') setIsUploadingAvatar(true);
    else setIsUploadingCover(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        if (type === 'avatar') {
          setAvatarUrl(data.url);
        } else {
          setCoverImageUrl(data.url);
        }
      } else {
        setUploadError(data.error || 'Failed to upload photo');
      }
    } catch {
      setUploadError('Network error while uploading photo');
    } finally {
      if (type === 'avatar') setIsUploadingAvatar(false);
      else setIsUploadingCover(false);
    }
  };

  const handlePhotoFeedUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (photoFeed.length >= 5) {
      setUploadError('Maximum 5 landscape photos allowed.');
      return;
    }

    setUploadError(null);
    setIsUploadingPhotoFeed(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'photo_feed');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        setPhotoFeed((prev) => [...prev, data.url].slice(0, 5));
      } else {
        setUploadError(data.error || 'Failed to upload photo');
      }
    } catch {
      setUploadError('Network error while uploading photo');
    } finally {
      setIsUploadingPhotoFeed(false);
      if (photoFeedInputRef.current) photoFeedInputRef.current.value = '';
    }
  };

  const handleVideoFeedUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (videoFeed.length >= 2) {
      setUploadError('Maximum 2 gameplay highlight videos allowed.');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setUploadError('Video file size exceeds 50MB maximum limit.');
      return;
    }

    setUploadError(null);
    setIsUploadingVideoFeed(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'video_feed');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        setVideoFeed((prev) => [...prev, data.url].slice(0, 2));
      } else {
        setUploadError(data.error || 'Failed to upload video');
      }
    } catch {
      setUploadError('Network error while uploading video');
    } finally {
      setIsUploadingVideoFeed(false);
      if (videoFeedInputRef.current) videoFeedInputRef.current.value = '';
    }
  };

  const removePhotoFeedItem = (index: number) => {
    setPhotoFeed((prev) => prev.filter((_, i) => i !== index));
  };

  const removeVideoFeedItem = (index: number) => {
    setVideoFeed((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <form action={formAction} className="space-y-8">
      {/* Hidden input fields to submit uploaded image URLs & feeds */}
      <input type="hidden" name="avatarUrl" value={avatarUrl} />
      <input type="hidden" name="coverImageUrl" value={coverImageUrl} />
      <input type="hidden" name="photoFeed" value={JSON.stringify(photoFeed)} />
      <input type="hidden" name="videoFeed" value={JSON.stringify(videoFeed)} />

      {uploadError && (
        <div className="p-4 rounded-[2px] bg-[#FF3D00]/10 border border-[#FF3D00]/30 text-[#FF3D00] flex items-center gap-2 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {state && (
        <div
          className={`p-4 rounded-[2px] flex items-center justify-between gap-3 text-sm ${
            state.success
              ? 'bg-[#00E676]/10 border border-[#00E676]/30 text-[#00E676]'
              : 'bg-[#FF3D00]/10 border border-[#FF3D00]/30 text-[#FF3D00]'
          }`}
        >
          <div className="flex items-center gap-2">
            {state.success ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span>{state.message}</span>
          </div>

          {state.success && activeSlug && (
            <Link
              href={`/players/${activeSlug}`}
              target="_blank"
              className="text-xs font-display font-bold uppercase tracking-wider underline hover:text-white flex items-center gap-1"
            >
              View Updated Profile <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      )}

      {/* 0. Photos & Visual Media Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Camera className="w-4 h-4 text-[#FFE93B]" /> Player Photos & Banner Cover
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Avatar Uploader */}
            <div className="space-y-3 p-4 bg-[#141414] border border-[#2A2A2A] rounded-[2px]">
              <div className="flex items-center justify-between">
                <label className="text-xs font-display uppercase tracking-wider text-white font-semibold flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-[#FFE93B]" /> Avatar Photo
                </label>
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={() => setAvatarUrl('')}
                    className="text-[11px] text-[#FF3D00] hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Remove
                  </button>
                )}
              </div>

              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-[2px] bg-[#1F1F1F] border-2 border-[#FFE93B]/60 shadow-[0_0_15px_rgba(255,233,59,0.15)] flex items-center justify-center overflow-hidden flex-shrink-0 relative group">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Player Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <img src="/photos/logo1.png" alt="Default Avatar" className="w-full h-full object-contain p-1 opacity-75" />
                  )}
                  {isUploadingAvatar && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-[#FFE93B]">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                  )}
                </div>

                <div className="space-y-2 flex-1">
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/webp, image/gif"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'avatar')}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="w-full text-xs"
                    disabled={isUploadingAvatar}
                    onClick={() => avatarInputRef.current?.click()}
                  >
                    {isUploadingAvatar ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5 mr-1.5 text-[#FFE93B]" /> Upload Avatar Image
                      </>
                    )}
                  </Button>
                  <p className="text-[11px] text-[#837D72]">
                    Recommended: Square 1:1 ratio (PNG, JPG, WEBP, max 50MB).
                  </p>
                </div>
              </div>
            </div>

            {/* Cover Banner Uploader */}
            <div className="space-y-3 p-4 bg-[#141414] border border-[#2A2A2A] rounded-[2px]">
              <div className="flex items-center justify-between">
                <label className="text-xs font-display uppercase tracking-wider text-white font-semibold flex items-center gap-2">
                  <ImageIcon className="w-3.5 h-3.5 text-[#FFE93B]" /> Background Cover Banner
                </label>
                {coverImageUrl && (
                  <button
                    type="button"
                    onClick={() => setCoverImageUrl('')}
                    className="text-[11px] text-[#FF3D00] hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Remove
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <div className="w-full h-24 sm:h-28 rounded-[2px] bg-[#1F1F1F] border border-[#837D72]/40 overflow-hidden relative group">
                  <img
                    src={coverImageUrl || '/photos/hero-bg.jpg'}
                    alt="Cover Banner"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2.5">
                    <span className="text-[10px] text-[#FFE93B] font-display uppercase tracking-wider font-semibold">
                      Header Banner Preview
                    </span>
                  </div>
                  {isUploadingCover && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-[#FFE93B]">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/webp, image/gif"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'cover')}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="w-full text-xs"
                    disabled={isUploadingCover}
                    onClick={() => coverInputRef.current?.click()}
                  >
                    {isUploadingCover ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5 mr-1.5 text-[#FFE93B]" /> Upload Cover Banner
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-[11px] text-[#837D72]">
                  Recommended: 1920x1080 or widescreen panorama banner (max 50MB).
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 1. Core Identity Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="w-4 h-4 text-[#FFE93B]" /> Player Identity & In-Game Tag
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-display uppercase tracking-wider text-[#ADABAB] mb-1.5">
                IGN / Gamer Tag *
              </label>
              <Input
                name="ign"
                required
                defaultValue={initialData.ign}
                placeholder="e.g. Learn"
              />
            </div>
            <div>
              <label className="block text-xs font-display uppercase tracking-wider text-[#ADABAB] mb-1.5">
                Display Name *
              </label>
              <Input
                name="displayName"
                required
                defaultValue={initialData.displayName}
                placeholder="e.g. Jash Shah"
              />
            </div>
            <div>
              <label className="block text-xs font-display uppercase tracking-wider text-[#ADABAB] mb-1.5">
                Real Name *
              </label>
              <Input
                name="realName"
                required
                defaultValue={initialData.realName}
                placeholder="e.g. Jash Shah"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-display uppercase tracking-wider text-[#ADABAB] mb-1.5">
                Competitive Role *
              </label>
              <select
                name="primaryRole"
                defaultValue={initialData.primaryRole}
                className="w-full bg-[#1F1F1F] text-white border border-[#837D72] text-sm rounded-[50px] px-5 py-2.5 focus:outline-none focus:border-[#FFE93B]"
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-display uppercase tracking-wider text-[#ADABAB] mb-1.5">
                State (India) *
              </label>
              <select
                name="state"
                required
                defaultValue={initialData.state || ''}
                className="w-full bg-[#1F1F1F] text-white border border-[#837D72] text-sm rounded-[50px] px-5 py-2.5 focus:outline-none focus:border-[#FFE93B]"
              >
                <option value="" disabled>Select State / UT</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-display uppercase tracking-wider text-[#ADABAB] mb-1.5">
                MobileRoster UID (19 Digits) *
              </label>
              <Input
                name="MobileRosterUid"
                required
                minLength={19}
                maxLength={19}
                pattern="\d{19}"
                title="UID must be exactly 19 digits"
                defaultValue={initialData.MobileRosterUid}
                placeholder="e.g. 6742819382109482910"
              />
            </div>
            <div>
              <label className="block text-xs font-display uppercase tracking-wider text-[#ADABAB] mb-1.5">
                Player Joined *
              </label>
              <select
                name="joinedYear"
                required
                defaultValue={initialData.joinedYear || ''}
                className="w-full bg-[#1F1F1F] text-white border border-[#837D72] text-sm rounded-[50px] px-5 py-2.5 focus:outline-none focus:border-[#FFE93B]"
              >
                {JOINED_YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Landscape Highlights & Media Feed Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Film className="w-4 h-4 text-[#FFE93B]" /> Landscape Media Feed & Highlights
            </span>
            <span className="text-[11px] font-mono text-[#837D72] font-normal">
              16:9 Landscape · Max 50MB
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Section A: 5 Landscape Photos Feed */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-2">
              <div>
                <h4 className="font-display uppercase text-xs text-white font-bold tracking-wider flex items-center gap-2">
                  <ImageIcon className="w-3.5 h-3.5 text-[#FFE93B]" /> Landscape Photos Feed ({photoFeed.length}/5)
                </h4>
                <p className="text-[11px] text-[#837D72]">
                  Upload up to 5 tournament photos, trophy celebrations, or scrim screenshots in landscape orientation (Max 50MB).
                </p>
              </div>

              {photoFeed.length < 5 && (
                <div>
                  <input
                    ref={photoFeedInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/webp, image/gif"
                    className="hidden"
                    onChange={handlePhotoFeedUpload}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    disabled={isUploadingPhotoFeed}
                    onClick={() => photoFeedInputRef.current?.click()}
                  >
                    {isUploadingPhotoFeed ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Uploading...
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5 mr-1 text-[#FFE93B]" /> Add Photo
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>

            {/* Photos Grid (16:9 widescreen landscape) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {photoFeed.map((url, idx) => (
                <div
                  key={idx}
                  className="relative aspect-video rounded-[2px] bg-[#1F1F1F] border border-[#2A2A2A] overflow-hidden group shadow-md"
                >
                  <img
                    src={url}
                    alt={`Feed Photo ${idx + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
                    <span className="text-[10px] text-[#FFE93B] font-display uppercase tracking-wider font-semibold">
                      Photo #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removePhotoFeedItem(idx)}
                      className="p-1.5 bg-[#FF3D00] text-white rounded-[2px] hover:bg-[#FF3D00]/80 transition-colors"
                      title="Remove Photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {photoFeed.length === 0 && (
                <div className="col-span-full p-8 rounded-[2px] border border-dashed border-[#2A2A2A] text-center space-y-2">
                  <ImageIcon className="w-8 h-8 text-[#555] mx-auto" />
                  <p className="text-xs text-[#837D72]">
                    No feed photos added yet. Click &quot;Add Photo&quot; to upload your landscape photos (up to 5 photos).
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Section B: 2 Gameplay Highlight Videos */}
          <div className="space-y-4 pt-4 border-t border-[#2A2A2A]">
            <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-2">
              <div>
                <h4 className="font-display uppercase text-xs text-white font-bold tracking-wider flex items-center gap-2">
                  <Video className="w-3.5 h-3.5 text-[#FFE93B]" /> Gameplay Highlight Videos ({videoFeed.length}/2)
                </h4>
                <p className="text-[11px] text-[#837D72]">
                  Upload up to 2 landscape gameplay clips (up to 60s clips, MP4/WEBM, max 50MB per video).
                </p>
              </div>

              {videoFeed.length < 2 && (
                <div>
                  <input
                    ref={videoFeedInputRef}
                    type="file"
                    accept="video/mp4, video/webm, video/quicktime, video/ogg"
                    className="hidden"
                    onChange={handleVideoFeedUpload}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    disabled={isUploadingVideoFeed}
                    onClick={() => videoFeedInputRef.current?.click()}
                  >
                    {isUploadingVideoFeed ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Uploading...
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5 mr-1 text-[#FFE93B]" /> Add 60s Video Clip
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>

            {/* Videos Grid (16:9 landscape video player) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {videoFeed.map((url, idx) => (
                <div
                  key={idx}
                  className="space-y-2 p-3 bg-[#141414] border border-[#2A2A2A] rounded-[2px]"
                >
                  <div className="relative aspect-video rounded-[2px] bg-black overflow-hidden border border-[#1F1F1F]">
                    <video
                      src={url}
                      controls
                      playsInline
                      preload="metadata"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-[#FFE93B] font-display uppercase tracking-wider font-semibold flex items-center gap-1.5">
                      <Film className="w-3.5 h-3.5" /> Video Clip #{idx + 1} (60s Max)
                    </span>
                    <button
                      type="button"
                      onClick={() => removeVideoFeedItem(idx)}
                      className="text-[11px] text-[#FF3D00] hover:underline flex items-center gap-1 font-medium"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove Clip
                    </button>
                  </div>
                </div>
              ))}

              {videoFeed.length === 0 && (
                <div className="col-span-full p-8 rounded-[2px] border border-dashed border-[#2A2A2A] text-center space-y-2">
                  <Video className="w-8 h-8 text-[#555] mx-auto" />
                  <p className="text-xs text-[#837D72]">
                    No gameplay video clips added yet. Click &quot;Add 60s Video Clip&quot; to showcase your top frags (up to 2 videos).
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Current Team */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#FFE93B]" /> Current Team / Roster
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-display uppercase tracking-wider text-[#ADABAB] mb-1.5">
                Team Name
              </label>
              <Input
                name="teamName"
                defaultValue={initialData.teamName}
                placeholder="e.g. GodLike (or leave empty if Free Agent)"
              />
            </div>
            <div>
              <label className="block text-xs font-display uppercase tracking-wider text-[#ADABAB] mb-1.5">
                Team Tag / Prefix
              </label>
              <Input
                name="teamTag"
                defaultValue={initialData.teamTag}
                placeholder="e.g. GODL"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Bio & Career */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#FFE93B]" /> Bio & Competitive Journey
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-xs font-display uppercase tracking-wider text-[#ADABAB] mb-1.5">
              Competitive Bio
            </label>
            <textarea
              name="bio"
              rows={3}
              defaultValue={initialData.bio}
              placeholder="Tell scouts, fans, and organizers about your playstyle, device, and strengths..."
              className="w-full bg-[#1F1F1F] text-white border border-[#837D72] rounded-[2px] p-3 text-sm focus:outline-none focus:border-[#FFE93B] placeholder:text-[#ADABAB]"
            />
          </div>
        </CardContent>
      </Card>

      {/* 5. Social Links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Share2 className="w-4 h-4 text-[#FFE93B]" /> Social Media Channels
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-display uppercase tracking-wider text-[#ADABAB] mb-1.5">
                YouTube URL
              </label>
              <Input
                name="youtubeUrl"
                defaultValue={initialData.youtubeUrl}
                placeholder="https://youtube.com/@channel"
              />
            </div>
            <div>
              <label className="block text-xs font-display uppercase tracking-wider text-[#ADABAB] mb-1.5">
                Instagram URL
              </label>
              <Input
                name="instagramUrl"
                defaultValue={initialData.instagramUrl}
                placeholder="https://instagram.com/handle"
              />
            </div>
            <div>
              <label className="block text-xs font-display uppercase tracking-wider text-[#ADABAB] mb-1.5">
                Twitter / X URL
              </label>
              <Input
                name="twitterUrl"
                defaultValue={initialData.twitterUrl}
                placeholder="https://x.com/handle"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 6. Google Search & SEO Keywords Discovery */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Search className="w-4 h-4 text-[#FFE93B]" /> Google Search & SEO Tags
            </span>
            <span className="text-[11px] font-mono text-[#FFE93B] bg-[#FFE93B]/10 px-2 py-0.5 rounded-[2px] border border-[#FFE93B]/30">
              SEARCH RANKING
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-[#141414] border border-[#2A2A2A] rounded-[2px] space-y-2">
            <div className="flex items-center gap-2 text-xs font-display uppercase tracking-wider text-[#FFE93B] font-bold">
              <Sparkles className="w-3.5 h-3.5" /> Live Google Search Preview
            </div>
            <div className="bg-[#0A0A0A] p-3 rounded-[2px] border border-[#1F1F1F] space-y-1 font-sans">
              <div className="text-[11px] text-[#837D72] flex items-center gap-1">
                <span>https://MobileRoster.in/players/{activeSlug}</span>
              </div>
              <div className="text-sm font-medium text-[#8ab4f8] hover:underline cursor-pointer">
                {initialData.ign || 'Player'} {initialData.displayName ? `(${initialData.displayName})` : ''} — Indian MobileRoster Mobile Player
              </div>
              <div className="text-xs text-[#bdc1c6] leading-relaxed">
                {initialData.seoDescription || initialData.bio || `Official MobileRoster Mobile competitive profile for ${initialData.ign || 'player'}, featuring verified tournaments, team history, and highlights.`}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-display uppercase tracking-wider text-[#ADABAB] mb-1.5 font-semibold">
                Google Search Keywords & Aliases (Comma-Separated)
              </label>
              <Input
                name="seoKeywords"
                defaultValue={initialData.seoKeywords}
                placeholder="e.g. shivan_ashwin, MobileRoster ashwin, shivan ashwin MobileRoster, ashwin MOBILEROSTER"
              />
              <p className="text-[11px] text-[#837D72] mt-1">
                Enter name variations and phrases people might search on Google to find your profile.
              </p>
            </div>

            <div>
              <label className="block text-xs font-display uppercase tracking-wider text-[#ADABAB] mb-1.5 font-semibold">
                Google Search Summary (Meta Description)
              </label>
              <textarea
                name="seoDescription"
                rows={2}
                defaultValue={initialData.seoDescription}
                placeholder="e.g. Official MobileRoster Mobile player profile for Shivan_ashwin. Verified tournament achievements, team history, frags, and socials."
                className="w-full bg-[#1F1F1F] text-white border border-[#837D72] rounded-[2px] p-3 text-sm focus:outline-none focus:border-[#FFE93B] placeholder:text-[#837D72]"
              />
              <p className="text-[11px] text-[#837D72] mt-1">
                Custom snippet description that appears in Google search engine result pages (Max 320 chars).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Floating Action Bar */}
      <div className="space-y-4 pt-4 border-t border-[#2A2A2A]">
        {state && (
          <div
            className={`p-4 rounded-[2px] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm ${
              state.success
                ? 'bg-[#00E676]/10 border border-[#00E676]/30 text-[#00E676]'
                : 'bg-[#FF3D00]/10 border border-[#FF3D00]/30 text-[#FF3D00]'
            }`}
          >
            <div className="flex items-center gap-2">
              {state.success ? (
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <span>{state.message}</span>
            </div>

            {state.success && activeSlug && (
              <Link
                href={`/players/${activeSlug}`}
                target="_blank"
                className="text-xs font-display font-bold uppercase tracking-wider underline hover:text-white flex items-center gap-1 shrink-0"
              >
                View Updated Profile <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-xs text-[#837D72]">
            All changes are published live to your official URL: <code className="text-[#FFE93B]">/players/{activeSlug}</code>
          </p>

          <Button size="lg" variant="primary" type="submit" isLoading={isPending}>
            <Save className="w-4 h-4 mr-2" />
            SAVE & PUBLISH PROFILE
          </Button>
        </div>
      </div>
    </form>
  );
};
