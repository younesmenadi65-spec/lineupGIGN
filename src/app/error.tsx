'use client';
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (<div className="mx-auto max-w-xl px-4 py-24 text-center"><h1 className="font-display text-5xl font-bold">Une erreur est survenue</h1>
    <p className="mt-3 text-muted">Le chargement a échoué. Réessayez dans un instant.</p>
    <button onClick={reset} className="mt-6 rounded bg-accent px-5 py-2.5 font-semibold text-ink">Réessayer</button></div>);
}
