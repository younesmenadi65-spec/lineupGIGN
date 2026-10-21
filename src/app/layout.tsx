import type { Metadata } from 'next';
import { Barlow, Barlow_Condensed } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

const display = Barlow_Condensed({ subsets: ['latin'], weight: ['600', '700'], variable: '--font-display' });
const body = Barlow({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-body' });
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'Rockford Lineups — grenades Garry’s Mod', template: '%s · Rockford Lineups' },
  description: 'Apprenez, enregistrez et partagez les lineups de smokes, flashes et frags sur la map Rockford de Garry’s Mod.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${display.variable} ${body.variable}`}>
      <body className="flex min-h-screen flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:bg-accent focus:px-3 focus:py-2 focus:text-ink">Aller au contenu</a>
        <Header />
        <main id="main" className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
