import { createPublicClient } from '@/lib/supabase/public';

// Force le sitemap à être dynamique pour éviter les blocages de build
export const dynamic = 'force-dynamic';

export default async function sitemap() {
  const supabase = createPublicClient();

  // Récupération des données (remplacez 'posts' ou 'lineups' par le nom exact de votre table)
  const { data: posts, error } = await supabase
    .from('lineups') // Mettez le nom de votre table ici (ex: 'lineups' ou 'posts')
    .select('id, updated_at');

  // Sécurité cruciale : si data est null ou s'il y a une erreur, on utilise un tableau vide []
  const safePosts = posts ?? [];

  const postUrls = safePosts.map((item) => ({
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://votre-site.com'}/lineups/${item.id}`,
    lastModified: item.updated_at ? new Date(item.updated_at) : new Date(),
  }));

  return [
    {
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://votre-site.com'}`,
      lastModified: new Date(),
    },
    {
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://votre-site.com'}/lineups`,
      lastModified: new Date(),
    },
    {
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://votre-site.com'}/map`,
      lastModified: new Date(),
    },
    ...postUrls,
  ];
}
