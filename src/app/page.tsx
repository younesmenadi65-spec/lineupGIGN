import Link from 'next/link';
import Image from 'next/image';
import { getLatest, getPopular, getStats } from '@/lib/data';
import { isConfigured } from '@/lib/supabase/server';
import { CategoryIcon, CATEGORY_TEXT } from '@/components/CategoryIcon';
import { LineupCard } from '@/components/LineupCard';
import { CATEGORIES, CATEGORY_LABEL, type Category } from '@/lib/types';

const DESC: Record<Category, string> = {
  smoke: 'Bloquer la vision, sécuriser une zone ou couvrir une progression.',
  flash: 'Aveugler les adversaires avant une entrée.',
  frag: 'Éliminer ou affaiblir les adversaires dans une zone.',
};

export default async function Home() {
  const [stats, popular, latest] = await Promise.all([getStats(), getPopular(), getLatest()]);
  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-line">
        <Image src="/placeholder-rockford.svg" alt="Illustration temporaire de la map Rockford" fill priority unoptimized className="-z-10 object-cover opacity-60" />
        <div className="mx-auto max-w-6xl px-4 py-24 md:py-36">
          <h1 className="max-w-3xl font-display text-5xl font-bold leading-[0.95] md:text-8xl">MASTER EVERY THROW. CONTROL ROCKFORD.</h1>
          <p className="mt-6 max-w-xl text-lg text-muted">Retrouvez, apprenez et partagez les lancers de smokes, flashes et frags sur la map Rockford de Garry’s Mod, avec des guides étape par étape.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/lineups" className="rounded bg-accent px-5 py-3 font-semibold text-ink transition-opacity hover:opacity-90">Explorer les lineups</Link>
            <Link href="/map" className="rounded border border-line bg-panel px-5 py-3 font-semibold transition-colors hover:border-accent">Voir la carte</Link>
          </div>
        </div>
      </section>

      {!isConfigured && (
        <p role="status" className="mx-auto mt-8 max-w-6xl rounded border border-accent px-4 py-3 text-sm">
          Supabase n’est pas configuré : ajoutez les variables du fichier <code>.env.example</code> pour afficher les lineups.
        </p>
      )}

      <section className="mx-auto max-w-6xl px-4 pt-12" aria-label="Catégories">
        <div className="grid gap-4 md:grid-cols-3">
          {CATEGORIES.map((c) => (
            <Link key={c} href={`/lineups?category=${c}`} className="group rounded-lg border border-line bg-panel p-6 transition-colors hover:border-accent">
              <CategoryIcon category={c} className={`h-10 w-10 ${CATEGORY_TEXT[c]}`} />
              <h2 className="mt-4 font-display text-3xl font-semibold">{CATEGORY_LABEL[c]}</h2>
              <p className="mt-1 text-muted">{DESC[c]}</p>
              <p className="mt-4 text-sm"><span className="font-semibold">{stats[c]}</span> lineup{stats[c] > 1 ? 's' : ''}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-12" aria-label="Statistiques">
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line md:grid-cols-4">
          {([['Lineups', stats.total], ['Smokes', stats.smoke], ['Flashes', stats.flash], ['Frags', stats.frag]] as const).map(([k, v]) => (
            <div key={k} className="bg-panel p-5"><dt className="text-sm text-muted">{k}</dt><dd className="font-display text-4xl font-bold">{v}</dd></div>
          ))}
        </dl>
      </section>

      {[['Lineups populaires', popular], ['Derniers guides ajoutés', latest]].map(([title, items]) => (
        <section key={title as string} className="mx-auto max-w-6xl px-4 pt-14">
          <h2 className="mb-5 font-display text-3xl font-semibold">{title as string}</h2>
          {(items as typeof popular).length === 0
            ? <p className="text-muted">Aucune lineup publiée pour le moment.</p>
            : <div className="grid gap-4 md:grid-cols-3">{(items as typeof popular).map((l) => <LineupCard key={l.id} lineup={l} />)}</div>}
        </section>
      ))}
    </>
  );
}
