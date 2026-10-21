import Link from 'next/link';
import type { Metadata } from 'next';
import { PAGE_SIZE, getLineups, getThrowTypes, getZones } from '@/lib/data';
import { LineupCard } from '@/components/LineupCard';
import { CATEGORIES, CATEGORY_LABEL, DIFFICULTIES, DIFFICULTY_LABEL } from '@/lib/types';

export const metadata: Metadata = { title: 'Lineups', description: 'Bibliothèque des lineups de smokes, flashes et frags sur Rockford.' };
type SP = Promise<Record<string, string | string[] | undefined>>;

const field = 'w-full rounded border border-line bg-raised px-3 py-2 text-sm';

export default async function LineupsPage({ searchParams }: { searchParams: SP }) {
  const raw = await searchParams;
  const get = (k: string) => { const v = raw[k]; return (Array.isArray(v) ? v[0] : v) || undefined; };
  const f = { q: get('q'), category: get('category'), difficulty: get('difficulty'), zone: get('zone'), throwType: get('throw'), sort: get('sort') ?? 'recent' };
  const page = Math.max(1, Number(get('page')) || 1);
  const [{ items, total }, zones, throwTypes] = await Promise.all([getLineups({ ...f, page }), getZones(), getThrowTypes()]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const href = (p: number) => {
    const qs = new URLSearchParams();
    Object.entries({ q: f.q, category: f.category, difficulty: f.difficulty, zone: f.zone, throw: f.throwType, sort: f.sort, page: p > 1 ? String(p) : undefined })
      .forEach(([k, v]) => v && qs.set(k, v));
    return `/lineups?${qs}`;
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-5xl font-bold">Lineups</h1>
      <form method="get" action="/lineups" className="mt-6 grid gap-3 rounded-lg border border-line bg-panel p-4 sm:grid-cols-2 lg:grid-cols-6">
        <label className="sm:col-span-2"><span className="mb-1 block text-xs text-muted">Recherche</span>
          <input name="q" defaultValue={f.q} placeholder="Nom de la lineup" className={field} /></label>
        <label><span className="mb-1 block text-xs text-muted">Catégorie</span>
          <select name="category" defaultValue={f.category ?? ''} className={field}><option value="">Toutes</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>)}</select></label>
        <label><span className="mb-1 block text-xs text-muted">Difficulté</span>
          <select name="difficulty" defaultValue={f.difficulty ?? ''} className={field}><option value="">Toutes</option>
            {DIFFICULTIES.map((d) => <option key={d} value={d}>{DIFFICULTY_LABEL[d]}</option>)}</select></label>
        <label><span className="mb-1 block text-xs text-muted">Zone</span>
          <select name="zone" defaultValue={f.zone ?? ''} className={field}><option value="">Toutes</option>
            {zones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}</select></label>
        <label><span className="mb-1 block text-xs text-muted">Type de lancer</span>
          <select name="throw" defaultValue={f.throwType ?? ''} className={field}><option value="">Tous</option>
            {throwTypes.map((t) => <option key={t} value={t}>{t}</option>)}</select></label>
        <label><span className="mb-1 block text-xs text-muted">Tri</span>
          <select name="sort" defaultValue={f.sort} className={field}>
            <option value="recent">Plus récentes</option><option value="popular">Popularité</option><option value="difficulty">Difficulté</option></select></label>
        <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-5 lg:justify-end">
          <Link href="/lineups" className="rounded border border-line px-4 py-2 text-sm hover:border-accent">Réinitialiser</Link>
          <button className="rounded bg-accent px-5 py-2 text-sm font-semibold text-ink">Filtrer</button>
        </div>
      </form>

      <p className="mt-6 text-sm text-muted" aria-live="polite">{total} résultat{total > 1 ? 's' : ''}</p>
      {items.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed border-line p-10 text-center">
          <p className="font-semibold">Aucune lineup ne correspond à ces filtres.</p>
          <p className="mt-1 text-muted">Élargissez la recherche ou réinitialisez les filtres.</p>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{items.map((l) => <LineupCard key={l.id} lineup={l} />)}</div>
      )}

      {pages > 1 && (
        <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-3 text-sm">
          {page > 1 && <Link href={href(page - 1)} className="rounded border border-line px-4 py-2 hover:border-accent">Précédent</Link>}
          <span className="text-muted">Page {page} sur {pages}</span>
          {page < pages && <Link href={href(page + 1)} className="rounded border border-line px-4 py-2 hover:border-accent">Suivant</Link>}
        </nav>
      )}
    </div>
  );
}
