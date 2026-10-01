'use client';

import * as React from 'react';
import {
  Megaphone,
  Send,
  Sparkles,
  Trophy,
  ShieldAlert,
  Swords,
  Layers,
  CheckCircle2,
  AlertCircle,
  Clock,
  Eye,
  Users,
  Radio,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { sendBroadcastAnnouncementAction } from '@/server/actions/broadcast';
import { BroadcastHistoryItem } from '@/server/data/broadcast-store';

interface BroadcastCenterFormProps {
  recipientCount: number;
  initialHistory: BroadcastHistoryItem[];
}

const TEMPLATES = [
  {
    id: 'custom',
    name: 'Blank Announcement',
    icon: Megaphone,
    badgeTitle: 'OFFICIAL ANNOUNCEMENT',
    subject: '',
    headline: '',
    bodyContent: '',
    ctaText: '',
    ctaUrl: '',
  },
  {
    id: 'tourney',
    name: 'Tournament Update',
    icon: Trophy,
    badgeTitle: 'TOURNAMENT ANNOUNCEMENT',
    subject: '',
    headline: '',
    bodyContent: '',
    ctaText: 'VIEW TOURNAMENTS',
    ctaUrl: '/tournaments',
  },
  {
    id: 'rules',
    name: 'Rulebook & Guidelines',
    icon: ShieldAlert,
    badgeTitle: 'RULEBOOK UPDATE',
    subject: '',
    headline: '',
    bodyContent: '',
    ctaText: 'READ PLATFORM RULES',
    ctaUrl: '/terms',
  },
  {
    id: 'scrims',
    name: 'Competitive Scrims',
    icon: Swords,
    badgeTitle: 'SCRIMS & MATCHMAKING',
    subject: '',
    headline: '',
    bodyContent: '',
    ctaText: 'EXPLORE TEAMS',
    ctaUrl: '/teams',
  },
];

export const BroadcastCenterForm: React.FC<BroadcastCenterFormProps> = ({
  recipientCount,
  initialHistory,
}) => {
  const [selectedTemplate, setSelectedTemplate] = React.useState('custom');
  const [badgeTitle, setBadgeTitle] = React.useState('');
  const [subject, setSubject] = React.useState('');
  const [headline, setHeadline] = React.useState('');
  const [bodyContent, setBodyContent] = React.useState('');
  const [ctaText, setCtaText] = React.useState('');
  const [ctaUrl, setCtaUrl] = React.useState('');

  const [isPending, setIsPending] = React.useState(false);
  const [showConfirmModal, setShowConfirmModal] = React.useState(false);
  const [result, setResult] = React.useState<{
    success: boolean;
    message?: string;
    error?: string;
    sentCount?: number;
  } | null>(null);

  const [history, setHistory] = React.useState<BroadcastHistoryItem[]>(initialHistory);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const tmpl = TEMPLATES.find((t) => t.id === templateId);
    if (tmpl) {
      setBadgeTitle(tmpl.badgeTitle);
      setSubject(tmpl.subject);
      setHeadline(tmpl.headline);
      setBodyContent(tmpl.bodyContent);
      setCtaText(tmpl.ctaText);
      setCtaUrl(tmpl.ctaUrl);
    }
  };

  const handleConfirmSend = async () => {
    setShowConfirmModal(false);
    setIsPending(true);
    setResult(null);

    const formData = new FormData();
    formData.append('subject', subject);
    formData.append('badgeTitle', badgeTitle);
    formData.append('headline', headline);
    formData.append('bodyContent', bodyContent);
    formData.append('ctaText', ctaText);
    formData.append('ctaUrl', ctaUrl);

    const res = await sendBroadcastAnnouncementAction(formData);
    setIsPending(false);
    setResult(res);

    if (res.success) {
      setHistory((prev) => [
        {
          id: `bc-${Date.now()}`,
          subject,
          headline,
          badgeTitle,
          recipientCount: res.recipientCount || recipientCount,
          sentAt: new Date().toISOString(),
          status: 'SENT',
        },
        ...prev,
      ]);
    }
  };

  return (
    <div className="space-y-8">
      {/* Template Quick Selection */}
      <div className="space-y-3">
        <label className="text-xs font-display uppercase tracking-wider text-[#ADABAB] font-semibold block">
          Choose Announcement Template Preset:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {TEMPLATES.map((tmpl) => {
            const Icon = tmpl.icon;
            const isSelected = selectedTemplate === tmpl.id;
            return (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => handleTemplateSelect(tmpl.id)}
                className={`p-3.5 rounded-[2px] border text-left transition-all flex items-center gap-3 ${
                  isSelected
                    ? 'bg-[#FFE93B]/10 border-[#FFE93B] shadow-[0_0_20px_rgba(255,233,59,0.15)]'
                    : 'bg-[#141414] border-[#2A2A2A] hover:border-[#3A3A3A] hover:bg-[#1A1A1A]'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-[2px] flex items-center justify-center flex-shrink-0 ${
                    isSelected
                      ? 'bg-[#FFE93B] text-black font-bold'
                      : 'bg-[#1F1F1F] text-[#ADABAB]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <span
                    className={`font-display text-xs font-bold uppercase block tracking-wide ${
                      isSelected ? 'text-[#FFE93B]' : 'text-white'
                    }`}
                  >
                    {tmpl.name}
                  </span>
                  <span className="text-[10px] text-[#837D72] block">
                    {tmpl.id === 'custom' ? 'Blank Draft' : 'Pre-built Content'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Editor & Live Email Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Editor Form (7 cols) */}
        <div className="lg:col-span-7 bg-[#141414] border border-[#2A2A2A] p-6 rounded-[2px] space-y-5">
          <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-4">
            <h3 className="font-display font-black text-lg text-white uppercase tracking-tight flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-[#FFE93B]" /> Broadcast Composer
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-[#FFE93B] font-mono bg-[#FFE93B]/10 border border-[#FFE93B]/30 px-2.5 py-1 rounded-[2px]">
              <Users className="w-3.5 h-3.5" />
              <span>{recipientCount} Recipient(s)</span>
            </div>
          </div>

          {result && (
            <div
              className={`p-4 rounded-[2px] border text-xs flex items-start gap-3 ${
                result.success
                  ? 'bg-green-950/40 border-green-700 text-green-300'
                  : 'bg-red-950/40 border-red-800 text-red-400'
              }`}
            >
              {result.success ? (
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-bold">{result.message || result.error}</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-display uppercase tracking-wider text-[#ADABAB] mb-1 font-semibold">
                  Badge Tag
                </label>
                <input
                  type="text"
                  value={badgeTitle}
                  onChange={(e) => setBadgeTitle(e.target.value)}
                  placeholder="e.g. TOURNAMENT ANNOUNCEMENT"
                  className="w-full bg-[#1F1F1F] border border-[#2A2A2A] rounded-[2px] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFE93B] transition-colors"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-display uppercase tracking-wider text-[#ADABAB] mb-1 font-semibold">
                  Headline (Header)
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. NATIONAL TOURNAMENT REGISTRATION"
                  className="w-full bg-[#1F1F1F] border border-[#2A2A2A] rounded-[2px] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFE93B] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-display uppercase tracking-wider text-[#ADABAB] mb-1 font-semibold">
                Email Subject Line <span className="text-[#FFE93B]">*</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. 🏆 Registration Open: CallOfDutyMobile Indian Championship"
                className="w-full bg-[#1F1F1F] border border-[#2A2A2A] rounded-[2px] px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFE93B] transition-colors font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-display uppercase tracking-wider text-[#ADABAB] mb-1 font-semibold">
                Message Body <span className="text-[#FFE93B]">*</span>
              </label>
              <textarea
                rows={6}
                value={bodyContent}
                onChange={(e) => setBodyContent(e.target.value)}
                placeholder="Write your announcement details here. Double line break creates a new paragraph."
                className="w-full bg-[#1F1F1F] border border-[#2A2A2A] rounded-[2px] px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFE93B] transition-colors resize-y leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-display uppercase tracking-wider text-[#ADABAB] mb-1 font-semibold">
                  Call to Action Button Label (Optional)
                </label>
                <input
                  type="text"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  placeholder="e.g. REGISTER YOUR ROSTER"
                  className="w-full bg-[#1F1F1F] border border-[#2A2A2A] rounded-[2px] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFE93B] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-display uppercase tracking-wider text-[#ADABAB] mb-1 font-semibold">
                  Target Destination URL (Optional)
                </label>
                <input
                  type="text"
                  value={ctaUrl}
                  onChange={(e) => setCtaUrl(e.target.value)}
                  placeholder="e.g. /tournaments or https://..."
                  className="w-full bg-[#1F1F1F] border border-[#2A2A2A] rounded-[2px] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFE93B] transition-colors"
                />
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-4 border-t border-[#2A2A2A] flex items-center justify-between">
              <span className="text-[11px] text-[#837D72]">
                Blasts to all verified players across the database.
              </span>
              <Button
                type="button"
                size="lg"
                variant="primary"
                isLoading={isPending}
                disabled={!subject || !bodyContent}
                onClick={() => setShowConfirmModal(true)}
              >
                <Send className="w-4 h-4 mr-2" />
                SEND BROADCAST (1-CLICK)
              </Button>
            </div>
          </div>
        </div>

        {/* Live Email Mockup Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-display tracking-widest text-[#FFE93B] uppercase font-semibold">
            <Eye className="w-4 h-4" />
            <span>LIVE EMAIL CLIENT PREVIEW</span>
          </div>

          <div className="bg-[#0A0A0A] border-2 border-[#2A2A2A] rounded-[4px] overflow-hidden shadow-2xl">
            {/* Top Accent Yellow Bar */}
            <div className="h-1.5 bg-[#FFE93B] w-full" />

            {/* Email Header */}
            <div className="p-5 border-b border-[#2A2A2A] bg-[#141414]">
              <span className="text-[10px] font-display tracking-widest text-[#FFE93B] uppercase font-bold block mb-1">
                {badgeTitle || 'OFFICIAL ANNOUNCEMENT'}
              </span>
              <h4 className="font-display font-black text-lg text-white uppercase tracking-tight leading-tight">
                {headline || subject || 'Announcement Title'}
              </h4>
            </div>

            {/* Email Body */}
            <div className="p-5 space-y-4 bg-[#141414]">
              <div className="text-xs text-[#D1D1D1] leading-relaxed whitespace-pre-line">
                {bodyContent || 'Your email announcement message will appear formatted here...'}
              </div>

              {ctaText && (
                <div className="pt-2">
                  <div className="inline-block bg-[#FFE93B] text-black font-display font-bold text-xs px-5 py-2.5 rounded-[2px] uppercase tracking-wider">
                    {ctaText} &rarr;
                  </div>
                </div>
              )}
            </div>

            {/* Email Footer */}
            <div className="p-4 bg-[#0F0F0F] border-t border-[#2A2A2A] text-center text-[10px] text-[#837D72]">
              You received this official dispatch as a registered player on CallOfDutyMobile India.<br />
              Indian MobileRoster Competitive Archive & Editorial Platform.
            </div>
          </div>
        </div>
      </div>

      {/* Broadcast History Table */}
      <div className="space-y-4 pt-4 border-t border-[#2A2A2A]">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-black text-lg text-white uppercase tracking-tight flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#FFE93B]" /> Past Dispatched Broadcasts
          </h3>
          <Badge variant="secondary" className="text-xs">
            {history.length} BLASTS RECORDED
          </Badge>
        </div>

        <div className="bg-[#141414] border border-[#2A2A2A] rounded-[2px] overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#2A2A2A] bg-[#191919] text-[#837D72] font-display uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 font-semibold">Date Sent</th>
                <th className="py-3 px-4 font-semibold">Category Tag</th>
                <th className="py-3 px-4 font-semibold">Subject Line</th>
                <th className="py-3 px-4 font-semibold">Recipients</th>
                <th className="py-3 px-4 font-semibold text-right">Delivery Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2A]">
              {history.map((item) => {
                const dateObj = new Date(item.sentAt);
                const formatted = dateObj.toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                });

                return (
                  <tr key={item.id} className="hover:bg-[#1A1A1A]/80 transition-colors">
                    <td className="py-3 px-4 font-mono text-[#837D72] whitespace-nowrap">
                      {formatted}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <Badge variant="primary" className="text-[9px]">
                        {item.badgeTitle}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 font-medium text-white max-w-xs truncate">
                      {item.subject}
                    </td>
                    <td className="py-3 px-4 font-mono text-[#FFE93B]">
                      {item.recipientCount} Players
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <Badge
                        variant={item.status === 'SENT' ? 'verified' : 'warning'}
                        className="text-[9px]"
                      >
                        {item.status}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#141414] border-2 border-[#FFE93B] rounded-[2px] p-6 space-y-5 shadow-[0_0_50px_rgba(255,233,59,0.25)] text-left">
            <div className="w-12 h-12 bg-[#FFE93B]/10 border border-[#FFE93B]/40 rounded-full flex items-center justify-center mx-auto text-[#FFE93B]">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="font-display font-black text-xl text-white uppercase tracking-tight">
                CONFIRM EMAIL BROADCAST
              </h3>
              <p className="text-xs text-[#ADABAB] leading-relaxed">
                You are about to dispatch this official email announcement directly to <strong className="text-[#FFE93B]">{recipientCount} registered player mailbox(es)</strong>.
              </p>
              <div className="p-3 bg-black/60 border border-[#2A2A2A] rounded-[2px] text-xs font-mono text-left text-[#FFE93B] truncate">
                Subject: {subject}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                size="md"
                variant="ghost"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </Button>
              <Button
                size="md"
                variant="primary"
                onClick={handleConfirmSend}
              >
                <Send className="w-4 h-4 mr-1.5" />
                YES, SEND BROADCAST NOW
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
