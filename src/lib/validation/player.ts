import { z } from 'zod';

export const PlayerRoleEnum = z.enum([
  'ENTRY_FRAGGER',
  'FRAGGER_SLAYER',
  'ANCHOR',
  'SCOUT_RECON',
  'SUPPORT',
  'IGL',
  'OVERWATCH',
  'RUSHER',
  'FLANKER',
  'MEDIC_REVIVER',
  'OBJECTIVE_PLAYER',
  'SLAYER',
  'OBJ',
  'FLEX',
  'SNIPER',
]);

export const PublishStatusEnum = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']);
export const VerificationStatusEnum = z.enum(['UNVERIFIED', 'VERIFIED', 'REVOKED']);

export const playerSchema = z.object({
  ign: z.string().min(2, 'IGN must be at least 2 characters').max(50, 'IGN cannot exceed 50 characters'),
  displayName: z.string().min(1, 'Display Name is required').max(100),
  realName: z.string().min(1, 'Real Name is required').max(100),
  slug: z.string().min(2).max(60).regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase letters, numbers, and hyphens'),
  avatarUrl: z.string().url('Must be a valid URL').optional().nullable(),
  coverImageUrl: z.string().url('Must be a valid URL').optional().nullable(),
  country: z.string().default('IN'),
  state: z.string().min(1, 'State is required').max(100),
  city: z.string().min(1, 'MobileRoster UID is required').regex(/^\d{19}$/, 'MobileRoster UID must be exactly 19 digits'),
  primaryRole: PlayerRoleEnum.default('FLEX'),
  secondaryRole: PlayerRoleEnum.optional().nullable(),
  bio: z.string().max(5000).optional().nullable(),
  competitiveHistory: z.string().min(1, 'Joined year is required').max(10000),
  isLookingForTeam: z.boolean().default(false),
  verificationStatus: VerificationStatusEnum.default('UNVERIFIED'),
  publishStatus: PublishStatusEnum.default('DRAFT'),
  seoTitle: z.string().max(160).optional().nullable(),
  seoDescription: z.string().max(320).optional().nullable(),
});

export type PlayerInput = z.infer<typeof playerSchema>;
