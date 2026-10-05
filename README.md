# 🎮 CallOfDutyMobile India — National Competitive Esports Platform

[![Next.js 16](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-6-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-336791?style=for-the-badge&logo=postgresql)](https://supabase.com/)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind-CSS_4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

The official national competitive esports directory, verified player portfolio hub, tournament registry, scrim veto engine, and roster archive for the Indian **Call of Duty: Mobile (CODM)** competitive ecosystem.

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
  - [Player Studio & Profiles](#1-player-studio--verified-profiles)
  - [Tournaments & Scrims Veto](#2-tournaments--scrim-map-veto)
  - [Teams & Rosters](#3-teams--rosters-management)
  - [Admin Command Center](#4-admin-command-center)
  - [Public Submissions & Verification](#5-public-submissions--organizer-onboarding)
- [Tech Stack](#-tech-stack)
- [Directory Structure](#-directory-structure)
- [Database Schema](#-database-schema)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Configuration](#environment-configuration)
  - [Database Setup & Migrations](#database-setup--migrations)
  - [Seeding the Database](#seeding-the-database)
  - [Running the Dev Server](#running-the-dev-server)
- [Validation & Security Architecture](#-validation--security-architecture)
- [Scripts Reference](#-scripts-reference)
- [Deployment Guide](#-deployment-guide)

---

## 🌟 Overview

**CallOfDutyMobile India** provides a dedicated, professional digital infrastructure for competitive mobile esports athletes, organizations, tournament organizers, and scouts. The platform solves fragmentation in the tier-1/tier-2/tier-3 competitive scene by standardizing player identities with verified in-game tags (IGNs), validated **19-digit numerical UIDs**, official team affiliations, verified tournament achievements, and structured JSON-LD SEO metadata for discovery across Google Search.

---

## 🚀 Key Features

### 1. Player Studio & Verified Profiles
- **Self-Service Player Studio**: Dedicated portal for registered players to manage their competitive profile, role specializations (Entry Fragger, Slayer, Anchor, Scout, IGL, Support, etc.), state, bio, and social links.
- **Strict 19-Digit UID Validation**: Ensures authentic in-game verification by enforcing exact 19-digit numerical CODM UIDs across schemas, server actions, and frontend forms.
- **Media & Highlight Galleries**: Players can showcase gameplay photos, highlight reels, and tournament clips.
- **SEO & Google Search Discovery**: Automated JSON-LD `Person` schema markup, custom OpenGraph social cards, dynamic slugs, and keyword metadata for maximum search discoverability.

### 2. Tournaments & Scrim Map Veto
- **Tournament Directory**: Tiered tournament listings (`S-Tier`, `A-Tier`, `B-Tier`, `Community`, `Collegiate`) displaying prize pools, brackets, schedules, format rules, and registered rosters.
- **Interactive Map Veto Room**: Real-time competitive ban-and-pick veto room with countdown timers, team coin toss, and map/mode elimination tailored for standard competitive formats (Hardpoint, Search & Destroy, Control).

### 3. Teams & Rosters Management
- **Official Team Hubs**: Organization profiles tracking active rosters, substitute benches, team captains, coaches, analysts, and win records.
- **Player Transfer History**: Comprehensive chronological record of roster movements and past team affiliations.

### 4. Admin Command Center
- **Executive Dashboard**: Real-time analytics on registered players, active squads, pending submissions, and community requests.
- **Direct Mail Invites**: Instant generation and dispatch of cryptographic one-time player onboarding credentials via automated email with branded HTML templates.
- **Broadcast & Announcement Center**: Publish national rulebook updates, regional tournament bulletins, and platform notices.
- **Audit Logging**: Comprehensive security audit log tracking administrative status modifications, deletions, and role promotions.
- **Media Assets Control**: Review and moderate uploaded player assets, badges, and verification proofs.

### 5. Public Submissions & Organizer Onboarding
- **Public Player Portfolio Intake**: Open portal for emerging players to submit their gaming credentials and tournament proof for review.
- **Spam Protection**: Multi-layered protection featuring honeypots, rate-limiting, and Zod payload sanitization.
- **Organizer Verification**: Host application flow for tier-1 organizers to unlock community tournament posting capabilities.

---

## 🛠 Tech Stack

| Domain | Technologies |
| :--- | :--- |
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Server Actions, Turbopack) |
| **UI & Runtime** | [React 19](https://react.dev/), [TypeScript 5](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) with custom Esports Dark Palette (`#FFE93B`, `#141414`, `#1F1F1F`) |
| **Database & ORM** | [PostgreSQL (Supabase)](https://supabase.com/) via [Prisma ORM 6](https://www.prisma.io/) |
| **Caching & Rate Limiting** | [Upstash Redis](https://upstash.com/) (`@upstash/redis`) + In-Memory Fallback |
| **Validation** | [Zod 4](https://zod.dev/) |
| **Email Delivery** | [Nodemailer](https://nodemailer.com/) with responsive dark-mode esports HTML templates |
| **Icons & UI Utilities** | [Lucide React](https://lucide.dev/), `clsx`, `tailwind-merge` |

---

## 📂 Directory Structure

```text
call-of-duty-mobile/
├── prisma/
│   ├── schema.prisma            # PostgreSQL Database Schema with Prisma ORM
│   └── seed.ts                  # Database seeding script for Admin & Default Achievements
├── public/                      # Static assets, fallback avatars, logos, and rulebooks
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── (public)/            # Public-facing routes (Home, Players, Teams, Tournaments, Scrims, Support, Search)
│   │   │   ├── player/          # Player Studio self-service dashboard
│   │   │   ├── players/         # Public player index and [slug] dynamic profile pages
│   │   │   ├── scrims/          # Scrim creator and interactive Map Veto room
│   │   │   ├── submit-player/   # Public player portfolio submission form
│   │   │   ├── teams/           # Team directories and [slug] roster pages
│   │   │   └── tournaments/     # Tournament registry and event details
│   │   ├── admin/               # Secure Admin Portal (Dashboard, Broadcast, Audit Logs, Submissions, Media)
│   │   ├── api/                 # REST API endpoints (Upload handler, Webhooks, Verification)
│   │   ├── globals.css          # Core design tokens, custom scrollbars, and Tailwind 4 theme
│   │   ├── layout.tsx           # Global Root layout with fonts, metadata, and Navbar/Footer
│   │   ├── robots.ts            # Dynamic robots.txt generator
│   │   └── sitemap.ts           # Dynamic XML sitemap generator
│   ├── components/              # Modular UI Components
│   │   ├── admin/               # Admin dashboard cards, DirectInviteModal, BroadcastCenterForm, AuditLogViewer
│   │   ├── common/              # Navbar, Footer, ScrollToTopHandler, Breadcrumbs
│   │   ├── players/             # PlayerCard, PlayerGrid, PlayerProfileEditorForm, PlayerMediaGallery
│   │   ├── scrims/              # MapVetoRoom, ScrimList, ScrimFilterBar
│   │   ├── teams/               # TeamCard, TeamGrid, RosterTable
│   │   ├── tournaments/         # TournamentCard, TournamentBracketView, PrizePoolDisplay
│   │   └── ui/                  # Core primitives (Button, Input, Modal, Badge, Dropdown, Skeleton)
│   ├── lib/                     # Utilities, Database Clients, Constants, and Validation Schemas
│   │   ├── constants/           # Game roles, Indian states, competitive maps, and modes
│   │   ├── db/                  # Prisma singleton client instance
│   │   ├── email/               # Nodemailer transporter and HTML email templates
│   │   ├── security/            # Token encryption, password hashing, and session management
│   │   └── validation/          # Zod validation schemas (playerSchema, authSchema, submissionSchema)
│   └── server/                  # Server Actions & Data Store
│       ├── actions/             # Next.js Server Actions (player-auth, admin-auth, scrims, submissions, broadcast)
│       └── data/                # Data access layers (community-store, audit-store)
├── .env.example                 # Template for environment configuration
├── next.config.ts               # Next.js configuration (Remote image domains, security headers)
├── package.json                 # Project dependencies and script runner
└── tsconfig.json                # TypeScript compiler settings
```

---

## 🗄 Database Schema

The database is modeled with Prisma and PostgreSQL to handle complex esports entity relations:

- **`User`**: Authentication credentials, password hash, role (`ADMIN`, `MODERATOR`, `PLAYER`, `USER`), session metadata.
- **`Player`**: In-game name (IGN), full name, slug, 19-digit UID (stored in `city`), primary/secondary competitive role, joined year, avatar/cover assets, SEO tags, publish status (`DRAFT`, `PUBLISHED`, `ARCHIVED`), and verification status (`UNVERIFIED`, `VERIFIED`, `REVOKED`).
- **`Team`** & **`TeamMember`**: Team name, tag, organization relation, logo, active roster mappings with member roles (`CAPTAIN`, `ACTIVE_ROSTER`, `SUBSTITUTE`, `COACH`, `ANALYST`).
- **`PlayerTeamHistory`**: Historical roster movements, joined/left dates.
- **`Tournament`**: Tier (`S_TIER` to `COLLEGIATE`), status (`UPCOMING`, `ONGOING`, `COMPLETED`), prize pool, schedule, rulebook URL, and MVP references.
- **`Achievement`** & **`PlayerAchievement`**: Trophy and title archive (`CHAMPIONSHIP`, `RUNNER_UP`, `MVP`, `ALL_STAR`).
- **`Submission`**: Public player portfolio submissions and organizer verification applications.
- **`AuditLog`**: Tamper-evident administrative audit trail with actor IDs, action categories, and timestamps.
- **`Media`** & **`SocialLink`**: Normalized multimedia galleries and social profiles across Twitter/X, YouTube, Instagram, and Discord.

---

## 🏁 Getting Started

### Prerequisites

- **Node.js**: `v20.x` or `v22.x` (LTS recommended)
- **Package Manager**: `npm` (v10+), `pnpm`, or `yarn`
- **Database**: A PostgreSQL instance (e.g. [Supabase](https://supabase.com), Neon, or local PostgreSQL)
- **Redis (Optional)**: [Upstash Redis](https://upstash.com) for production distributed rate limiting

---

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/callofduty12mobile18-arch/callofdutymobile.git
   cd callofdutymobile
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

---

### Environment Configuration

Create a `.env` file in the root directory by copying `.env.example`:

```bash
cp .env.example .env
```

Populate the required environment variables:

```env
# ========================================================
# Database Connection (Supabase / PostgreSQL)
# ========================================================
# Transaction Pooler URL (for Serverless Execution)
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct URL (required for Prisma Migrations)
DIRECT_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:5432/postgres"

# ========================================================
# Supabase Integration (Storage & Auth)
# ========================================================
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT_REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# ========================================================
# Platform Security & Canonical Settings
# ========================================================
# Cryptographic secret for signing sessions (min 32 random characters)
SESSION_SECRET="generate-a-secure-random-32-plus-character-secret-key"

# Canonical URL for SEO, Sitemap, and OpenGraph
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# ========================================================
# Distributed Rate Limiting (Upstash Redis)
# ========================================================
UPSTASH_REDIS_REST_URL="https://your-redis-instance.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-upstash-redis-rest-token"

# ========================================================
# Automated Email Delivery (Nodemailer SMTP)
# ========================================================
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="465"
SMTP_USER="esports@yourdomain.com"
SMTP_PASS="your-16-character-app-password"
SMTP_FROM="\"CallOfDutyMobile India\" <esports@yourdomain.com>"

# ========================================================
# Initial Seeding Credentials (Only for prisma/seed.ts)
# ========================================================
SEED_ADMIN_EMAIL="admin@callofdutymobile.in"
SEED_ADMIN_PASSWORD="SecureAdminPassword2026!"
```

---

### Database Setup & Migrations

1. **Generate Prisma Client**:
   ```bash
   npx prisma generate
   ```

2. **Push Database Schema**:
   ```bash
   npx prisma db push
   ```
   *(Or apply migrations in production: `npx prisma migrate deploy`)*

---

### Seeding the Database

Initialize default competitive achievements and the master administrator account:

```bash
npm run seed
```

---

### Running the Dev Server

Launch the development server with Next.js Turbopack:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

- **Public Hub**: `http://localhost:3000`
- **Player Studio**: `http://localhost:3000/player`
- **Admin Portal**: `http://localhost:3000/admin/login`

---

## 🛡 Validation & Security Architecture

1. **Strict 19-Digit UID Requirement**:
   - Call of Duty: Mobile player account UIDs are strictly 19 digits long.
   - Form inputs validate with HTML constraints: `minLength={19}`, `maxLength={19}`, `pattern="\d{19}"`.
   - Zod schemas enforce regex: `/^\d{19}$/`.
   - Server Actions independently reject any input failing the 19-digit numerical format.
2. **Session Security**:
   - Tamper-proof, cryptographically signed HTTP-only cookies encrypted with `SESSION_SECRET`.
   - Production enforcement halts server boot if the secret is insecure or under 32 characters.
3. **Anti-Spam Protection**:
   - Submission forms include hidden honeypot fields (`honeypot`).
   - Rate limiting powered by Upstash Redis prevents denial-of-service and brute force attempts.
4. **Input Sanitization**:
   - All external media links and social URLs are validated via custom URL parsers to prevent XSS.

---

## 📜 Scripts Reference

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Next.js development server with Turbopack |
| `npm run build` | Builds the optimized production application |
| `npm run start` | Starts the production server |
| `npm run lint` | Runs ESLint to check for code quality and convention violations |
| `npm run seed` | Seeds default achievements and platform administrator (`prisma/seed.ts`) |
| `npx prisma studio` | Opens Prisma's visual database browser |
| `npx tsc --noEmit` | Validates TypeScript types across the entire codebase |

---

## 🚀 Deployment Guide

### Deploying to Vercel

1. Push your repository to GitHub.
2. Import the project into **Vercel**.
3. Under **Project Settings > Environment Variables**, add all keys from `.env.example`.
4. Ensure `NEXT_PUBLIC_SITE_URL` points to your production custom domain (e.g. `https://callofdutymobile.in`).
5. Ensure `postinstall` script runs `prisma generate` (configured in `package.json`).
6. Deploy!

---

## 📄 License & Fair Use

This project is built for the Indian competitive esports community. All game assets, trademarks, and logos associated with *Call of Duty: Mobile* belong to **Activision Publishing, Inc.** and **TiMi Studio Group**.

---

<div align="center">
  <sub>Built with ❤️ for the Indian Esports Community.</sub>
</div>
