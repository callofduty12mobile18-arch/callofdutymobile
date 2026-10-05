import { PrismaClient } from '@prisma/client';
import { main as seedDatabase } from './seed';

const prisma = new PrismaClient();

async function resetDatabase() {
  const hasConfirmWipeFlag = process.argv.includes('--confirm-wipe');
  if (!hasConfirmWipeFlag) {
    throw new Error(
      'DATABASE WIPE ABORTED: The "--confirm-wipe" command line flag is mandatory to execute a database reset.\nExample: npm run seed:reset -- --confirm-wipe'
    );
  }

  const databaseUrl = process.env.DATABASE_URL || '';
  const isLocalhost = databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1');
  const isForceWipe = process.env.FORCE_WIPE === 'yes';

  if (!isLocalhost && !isForceWipe) {
    throw new Error(
      'DATABASE WIPE ABORTED: Refusing to wipe non-localhost database without explicit FORCE_WIPE=yes environment variable.'
    );
  }

  console.log('--- Wiping all existing database records ---');

  await prisma.auditLog.deleteMany();
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

  console.log('--- Database wiped clean. Now seeding initial records ---');

  await seedDatabase();
}

resetDatabase()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
