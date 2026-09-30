import { MetadataRoute } from 'next';
import { getPublishedPlayers } from '@/server/queries/players';
import { getPublishedTeams } from '@/server/queries/teams';
import { getPublishedTournaments } from '@/server/queries/tournaments';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://callofdutymobile.in';

  const [playersData, teams, tournaments] = await Promise.all([
    getPublishedPlayers({ limit: 100 }),
    getPublishedTeams(),
    getPublishedTournaments(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/players`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/teams`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/tournaments`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/submit-player`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  ];

  const playerRoutes: MetadataRoute.Sitemap = playersData.players.map((p) => ({
    url: `${baseUrl}/players/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const teamRoutes: MetadataRoute.Sitemap = teams.map((t) => ({
    url: `${baseUrl}/teams/${t.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const tournamentRoutes: MetadataRoute.Sitemap = tournaments.map((tr) => ({
    url: `${baseUrl}/tournaments/${tr.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...playerRoutes, ...teamRoutes, ...tournamentRoutes];
}
