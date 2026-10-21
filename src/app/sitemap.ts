import type { MetadataRoute } from 'next';
import { getLineups } from '@/lib/data';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const { items } = await getLineups({ page: 1 });
  return [
    { url: base }, { url: `${base}/lineups` }, { url: `${base}/map` }, { url: `${base}/about` },
    ...items.map((l) => ({ url: `${base}/lineups/${l.slug}`, lastModified: l.updated_at })),
  ];
}
