import { PrismaClient, RoleType, AchievementCategory } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword || adminPassword.length < 12) {
    throw new Error('Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD (min 12 chars) before seeding.');
  }
  if (process.env.NODE_ENV === 'production' && process.env.SEED_CONFIRM_WIPE !== 'yes') {
    throw new Error('Seeding deletes ALL data. Set SEED_CONFIRM_WIPE=yes to run it in production.');
  }

  console.log('--- Initializing Clean CallOfDutyMobile Database ---');

  // Clean all existing data
  await prisma.playerAchievement.deleteMany();
  await prisma.teamAchievement.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.playerTeamHistory.deleteMany();
  await prisma.socialLink.deleteMany();
  await prisma.media.deleteMany();
  await prisma.document.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.article.deleteMany();
  await prisma.tournament.deleteMany();
  await prisma.player.deleteMany();
  await prisma.team.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.user.deleteMany();

  // Hash admin password
  const adminPasswordHash = bcrypt.hashSync(adminPassword, 12);

  // Create default platform Admin account
  await prisma.user.create({
    data: {
      email: adminEmail.trim().toLowerCase(),
      role: RoleType.ADMIN,
      passwordHash: adminPasswordHash,
    },
  });

  // Create standard achievement definitions
  await prisma.achievement.createMany({
    data: [
      {
        title: 'National Champion',
        description: '1st Place in official Indian championship tournament.',
        category: AchievementCategory.CHAMPIONSHIP,
      },
      {
        title: 'Finals MVP',
        description: 'Awarded to the Most Valuable Player in tournament finals.',
        category: AchievementCategory.MVP,
      },
      {
        title: 'Tournament Runner-up',
        description: '2nd Place finish in national tournament.',
        category: AchievementCategory.RUNNER_UP,
      },
    ],
  });

  console.log('--- Clean database initialized successfully with Admin user & Achievements. ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
