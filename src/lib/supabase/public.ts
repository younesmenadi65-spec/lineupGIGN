import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Client Supabase public/statique (sans cookies) 
 * Idéal pour les sitemaps, les pages statiques ou les récupérations de données publiques.
 */
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export function isConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}
