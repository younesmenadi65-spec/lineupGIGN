import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-20 border-t border-line bg-panel">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 text-sm text-muted md:grid-cols-[1fr_auto]">
        <p className="max-w-xl">Projet communautaire, non affilié aux créateurs de Garry’s Mod ni de la map Rockford. Les lineups non vérifiées en jeu sont signalées comme telles.</p>
        <ul className="flex gap-4">
          <li><Link className="hover:text-text" href="/lineups">Lineups</Link></li>
          <li><Link className="hover:text-text" href="/map">Carte</Link></li>
          <li><Link className="hover:text-text" href="/about">À propos</Link></li>
        </ul>
      </div>
    </footer>
  );
}
