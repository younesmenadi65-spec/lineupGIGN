import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Crée un client Supabase côté serveur avec gestion sécurisée des cookies
 */
export function createClient() {
  const store = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return store.getAll()
        },
        setAll(list: { name: string; value: string; options: CookieOptions }[]) {
          try {
            list.forEach(({ name, value, options }) => {
              store.set(name, value, options)
            })
          } catch {
            // L'appel a été fait depuis un Server Component, 
            // ce qui empêche la modification des cookies (normal dans Next.js App Router).
          }
        },
      },
    }
  )
}

/**
 * Vérifie si les variables d'environnement Supabase sont correctement configurées
 */
export function isConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}
