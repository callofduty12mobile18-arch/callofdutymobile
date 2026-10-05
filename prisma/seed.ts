import { PrismaClient, RoleType, AchievementCategory } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword || adminPassword.length < 12) {
    throw new Error('Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD (min 12 chars) before seeding.');
  }

  console.log('--- Running Non-Destructive CallOfDutyMobile Database Seed ---');

  // Hash admin password
  const adminPasswordHash = bcrypt.hashSync(adminPassword, 12);

  // Non-destructive: Upsert admin user by email
  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail.trim().toLowerCase() },
    update: {
      role: RoleType.ADMIN,
      passwordHash: adminPasswordHash,
      emailVerified: true,
    },
    create: {
      email: adminEmail.trim().toLowerCase(),
      role: RoleType.ADMIN,
      passwordHash: adminPasswordHash,
      emailVerified: true,
    },
  });

  console.log(`Admin user ensured: ${adminUser.email} (Role: ${adminUser.role})`);

  // Non-destructive: Create achievements only if missing
  const defaultAchievements = [
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
  ];

  for (const ach of defaultAchievements) {
    const existing = await prisma.achievement.findFirst({
      where: { title: ach.title },
    });
    if (!existing) {
      await prisma.achievement.create({ data: ach });
      console.log(`Created missing achievement: ${ach.title}`);
    } else {
      console.log(`Achievement already exists: ${ach.title}`);
    }
  }

  console.log('--- Non-destructive database seed completed successfully. ---');
}

if (require.main === module) {
  main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
