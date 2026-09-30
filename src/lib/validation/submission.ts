import { z } from 'zod';
import { PlayerRoleEnum } from './player';

export const playerPortfolioSubmissionSchema = z.object({
  submitterName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  submitterEmail: z.string().email('Invalid email address'),
  submitterPhone: z.string().max(30).optional().nullable(),
  
  // Player Details
  ign: z.string().min(2, 'IGN must be at least 2 characters').max(50),
  displayName: z.string().max(100).optional().nullable(),
  realName: z.string().max(100).optional().nullable(),
  primaryRole: PlayerRoleEnum,
  state: z.string().max(100).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  currentTeam: z.string().max(100).optional().nullable(),
  previousTeams: z.string().max(500).optional().nullable(),
  bio: z.string().max(2000, 'Bio cannot exceed 2000 characters').optional().nullable(),
  tournamentHistory: z.string().max(5000).optional().nullable(),
  achievements: z.string().max(3000).optional().nullable(),
  
  // Social Links
  youtubeUrl: z.string().url('Invalid YouTube URL').or(z.literal('')).optional().nullable(),
  instagramUrl: z.string().url('Invalid Instagram URL').or(z.literal('')).optional().nullable(),
  twitterUrl: z.string().url('Invalid Twitter / X URL').or(z.literal('')).optional().nullable(),
  discordTag: z.string().max(50).optional().nullable(),
  
  // Verification Proof Attachment URL or Storage Path
  proofDocumentUrl: z.string().url().or(z.literal('')).optional().nullable(),
  avatarUrl: z.string().url().or(z.literal('')).optional().nullable(),
  
  // Anti-Spam Honeypot field (must remain empty)
  honeypot: z.string().max(0, 'Spam detected').optional(),
});

export type PlayerPortfolioSubmissionInput = z.infer<typeof playerPortfolioSubmissionSchema>;
