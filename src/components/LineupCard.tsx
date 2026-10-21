import Link from 'next/link';
import Image from 'next/image';
import { CategoryIcon, CATEGORY_TEXT } from './CategoryIcon';
import { CATEGORY_LABEL, DIFFICULTY_LABEL, type Lineup } from '@/lib/types';

export function StatusBadge({ lineup }: { lineup: Pick<Lineup, 'verified' | 'is_demo'> }) {
  const [text, cls] = lineup.verified ? ['Vérifiée en jeu', 'border-accent text-accent']
    : lineup.is_demo ? ['Démonstration — à compléter', 'border-line text-muted'] : ['Non vérifiée', 'border-line text-muted'];
  return <span className={`inline-block rounded border px-2 py-0.5 text-xs font-medium ${cls}`}>{text}</span>;
}

export function LineupCard({ lineup }: { lineup: Lineup }) {
  return (
    <Link href={`/lineups/${lineup.slug}`} className="group flex flex-col overflow-hidden rounded-lg border border-line bg-panel transition-colors hover:border-accent">
      <div className="relative aspect-video bg-raised">
        <Image src={lineup.thumbnail_url ?? '/placeholder-rockford.svg'} alt="" fill unoptimized={!lineup.thumbnail_url} sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="object-cover" />
        <span className={`absolute left-3 top-3 flex items-center gap-1.5 rounded bg-ink/90 px-2 py-1 text-sm font-semibold ${CATEGORY_TEXT[lineup.category]}`}>
          <CategoryIcon category={lineup.category} className="h-4 w-4" />{CATEGORY_LABEL[lineup.category]}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-display text-xl font-semibold leading-tight group-hover:text-accent">{lineup.title}</h3>
        <p className="text-sm text-muted">{lineup.start_zone?.name ?? '—'} vers {lineup.target_zone?.name ?? '—'}</p>
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
          <span className="rounded bg-raised px-2 py-0.5 text-xs">{DIFFICULTY_LABEL[lineup.difficulty]}</span>
          <StatusBadge lineup={lineup} />
        </div>
      </div>
    </Link>
  );
}
