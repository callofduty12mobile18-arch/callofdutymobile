# CallOfDutyMobile India — National Competitive Platform

Official competitive community directory, player profiles, tournament registry, and roster archive for Indian Call of Duty: Mobile.

## Features
- **Player Studio**: Self-service profile builder with custom game roles, IGNs, and portfolio uploads.
- **SEO & Google Search Discovery**: Automated JSON-LD Person schemas, dynamic meta tags, and searchable aliases.
- **Admin Management Portal**: Approval queues, direct player mail invitations with automated credentials, audit logs, and broadcasts.
- **Tournaments & Teams**: National rankings, roster archives, and tournament databases.

## Tech Stack
- **Framework**: Next.js 16 (App Router & Turbopack)
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS & Modern Dark/Esports Aesthetics
- **Email Service**: Nodemailer SMTP with customized responsive templates

## Required environment
- `SESSION_SECRET` — at least 32 random characters (e.g. `openssl rand -base64 48`). The app refuses to sign sessions in production without it.
- `DATABASE_URL`, `DIRECT_URL`, and `SMTP_*` for mail.
- `SUPABASE_SERVICE_ROLE_KEY` only if you use `src/lib/storage`.
