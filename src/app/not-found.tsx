import Link from 'next/link';
export default function NotFound() {
  return (<div className="mx-auto max-w-xl px-4 py-24 text-center"><h1 className="font-display text-5xl font-bold">Page introuvable</h1>
    <p className="mt-3 text-muted">Cette page n’existe pas ou n’est plus publiée.</p>
    <Link href="/lineups" className="mt-6 inline-block rounded bg-accent px-5 py-2.5 font-semibold text-ink">Voir les lineups</Link></div>);
}
