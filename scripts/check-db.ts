import { prisma } from '../src/lib/db/prisma';

async function main() {
  const players = await prisma.player.findMany({
    include: { teamMemberships: { include: { team: true } } },
  });
  console.log('PLAYERS:', JSON.stringify(players, null, 2));

  const teams = await prisma.team.findMany();
  console.log('TEAMS:', JSON.stringify(teams, null, 2));
}

main().finally(() => prisma.$disconnect());
