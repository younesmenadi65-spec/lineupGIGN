import Link from 'next/link';

const NAV = [
  { href: '/', label: 'Accueil' }, { href: '/lineups', label: 'Lineups' }, { href: '/map', label: 'Carte' },
  { href: '/favoris', label: 'Favoris' }, { href: '/about', label: 'À propos' },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ink/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="font-display text-2xl font-bold tracking-wide">
          ROCKFORD <span className="text-accent">LINEUPS</span>
        </Link>
        <nav aria-label="Navigation principale">
          <ul className="flex flex-wrap items-center gap-1 text-sm font-medium text-muted">
            {NAV.map((n) => (
              <li key={n.href}><Link href={n.href} className="rounded px-2.5 py-1.5 transition-colors hover:bg-raised hover:text-text">{n.label}</Link></li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
