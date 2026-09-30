import { PrismaClient, RoleType, AchievementCategory } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
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

  // Create default platform Admin account
  await prisma.user.create({
    data: {
      email: 'admin@callofdutymobile.in',
      role: RoleType.ADMIN,
      passwordHash: 'CODM-ADMIN-2024',
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
