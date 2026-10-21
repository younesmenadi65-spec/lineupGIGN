import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getLineupBySlug } from '@/lib/data';
import { CategoryIcon, CATEGORY_TEXT } from '@/components/CategoryIcon';
import { LineupCard, StatusBadge } from '@/components/LineupCard';
import { CATEGORY_LABEL, DIFFICULTY_LABEL } from '@/lib/types';

type Props = { params: Promise<{ slug: string }> };
const fmt = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getLineupBySlug(slug);
  if (!data) return { title: 'Lineup introuvable' };
  const { lineup } = data;
  return { title: lineup.title, description: lineup.description.slice(0, 155), openGraph: { title: lineup.title, description: lineup.description.slice(0, 155) } };
}

export default async function LineupPage({ params }: Props) {
  const { slug } = await params;
  const data = await getLineupBySlug(slug);
  if (!data) notFound();
  const { lineup: l, steps, similar } = data;

  return (
    <article className="mx-auto max-w-4xl px-4 py-10">
      <Link href="/lineups" className="text-sm text-muted hover:text-text">Retour aux lineups</Link>
      <header className="mt-4">
        <p className={`flex items-center gap-2 font-semibold ${CATEGORY_TEXT[l.category]}`}><CategoryIcon category={l.category} className="h-5 w-5" />{CATEGORY_LABEL[l.category]}</p>
        <h1 className="mt-1 font-display text-5xl font-bold leading-tight">{l.title}</h1>
        <div className="mt-3 flex flex-wrap gap-2"><StatusBadge lineup={l} /><span className="rounded bg-raised px-2 py-0.5 text-xs">{DIFFICULTY_LABEL[l.difficulty]}</span></div>
      </header>

      {l.is_demo && !l.verified && (
        <p role="note" className="mt-6 rounded border border-line bg-panel px-4 py-3 text-sm text-muted">
          Démonstration — à compléter. Cette fiche n’a pas été testée en jeu et ne contient aucun point de lancer réel.
        </p>
      )}

      <dl className="mt-8 grid gap-px overflow-hidden rounded-lg border border-line bg-line text-sm sm:grid-cols-2">
        {[
          ['Zone de départ', l.start_zone?.name ?? 'Non renseignée'], ['Zone d’impact', l.target_zone?.name ?? 'Non renseignée'],
          ['Type de lancer', l.throw_type ?? 'Non renseigné'], ['Auteur', l.author?.username ?? 'Communauté'],
          ['Créée le', fmt(l.created_at)], ['Modifiée le', fmt(l.updated_at)],
          ['Version de la map', l.map_version ?? 'Inconnue'], ['Vérifiée le', l.verified && l.verified_at ? fmt(l.verified_at) : 'Pas encore vérifiée'],
        ].map(([k, v]) => <div key={k} className="bg-panel p-4"><dt className="text-muted">{k}</dt><dd className="font-medium">{v}</dd></div>)}
      </dl>

      <section className="mt-8"><h2 className="font-display text-2xl font-semibold">Situation tactique</h2>
        <p className="mt-2 max-w-prose whitespace-pre-line text-muted">{l.description || 'Aucune description.'}</p>
        {l.tags.length > 0 && <ul className="mt-3 flex flex-wrap gap-2">{l.tags.map((t) => <li key={t} className="rounded bg-raised px-2 py-0.5 text-xs text-muted">{t}</li>)}</ul>}
      </section>

      <section className="mt-10"><h2 className="font-display text-2xl font-semibold">Guide étape par étape</h2>
        {steps.length === 0 ? <p className="mt-2 text-muted">Les étapes de ce guide ne sont pas encore renseignées.</p> : (
          <ol className="mt-4 space-y-4">
            {steps.map((s) => (
              <li key={s.id} className="rounded-lg border border-line bg-panel p-5">
                <h3 className="font-display text-xl font-semibold"><span className="mr-2 text-accent">{s.step_number}.</span>{s.title}</h3>
                <p className="mt-2 max-w-prose whitespace-pre-line text-muted">{s.instructions}</p>
                {s.image_url && <div className="relative mt-4 aspect-video overflow-hidden rounded bg-raised"><Image src={s.image_url} alt={`Capture : ${s.title}`} fill sizes="(min-width:896px) 800px, 100vw" className="object-contain" /></div>}
                {s.video_url && <a href={s.video_url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm text-accent underline">Voir la vidéo</a>}
              </li>
            ))}
          </ol>
        )}
      </section>

      {similar.length > 0 && (
        <section className="mt-12"><h2 className="mb-4 font-display text-2xl font-semibold">Lineups similaires</h2>
          <div className="grid gap-4 sm:grid-cols-3">{similar.map((s) => <LineupCard key={s.id} lineup={s} />)}</div></section>
      )}
    </article>
  );
}
