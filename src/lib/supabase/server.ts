import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        // 👇 C'est ici qu'il faut ajouter le typage : "(list: Array<{ name: string; value: string; options: any }>)"
        setAll(list: Array<{ name: string; value: string; options: any }>) {
          try {
            list.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // L'appel provient d'un Server Component (ce qui est normal)
          }
        },
      },
    }
  )
}
