// ❌ NE PAS faire ça dans le sitemap :
// import { createClient } from '@/lib/supabase/server'

// ✅ Faire ceci à la place :
import { createPublicClient } from '@/lib/supabase/public'

export default async function sitemap() {
  const supabase = createPublicClient()
  
  // Vos requêtes Supabase ici...
  const { data: posts } = await supabase.from('posts').select('slug, updated_at')

  // ... reste de votre code sitemap
}
