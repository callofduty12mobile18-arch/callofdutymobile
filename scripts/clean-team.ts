import { prisma } from '../src/lib/db/prisma';

async function main() {
  await prisma.team.updateMany({
    where: { name: { contains: 'Esports', mode: 'insensitive' } },
    data: {
      name: 'Revenant CODM',
      slug: 'revenant-codm',
    },
  });
  console.log('Updated team names successfully.');
}

main().finally(() => prisma.$disconnect());
