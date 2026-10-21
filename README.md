# Rockford Lineups

Next.js 15 (App Router) + TypeScript + Tailwind 3 + Supabase.

## État actuel
Fait : schéma SQL complet avec RLS et buckets, accueil, bibliothèque `/lineups` (filtres, tri, pagination, URL partageable), fiche `/lineups/[slug]`, SEO (métadonnées, sitemap, robots), pages 404/erreur/chargement, seed de démonstration.
Pas encore fait : authentification, favoris, formulaire de contribution, signalements, carte `/map`, panel `/admin`, tests.
Le build n'a pas été exécuté (pas d'accès réseau pour installer les dépendances) : lancez `npm run typecheck` puis `npm run build` et corrigez les éventuelles erreurs.

## Installation
1. `npm install`
2. Créez un projet sur supabase.com.
3. Supabase > SQL Editor : collez et exécutez `supabase/migrations/0001_init.sql`, puis `supabase/seed.sql`.
4. Copiez `.env.example` en `.env.local` et renseignez l'URL et la clé `anon` (Project Settings > API). N'utilisez jamais la clé `service_role`.
5. `npm run dev` puis ouvrez http://localhost:3000

## Premier administrateur (sans mot de passe dans le code)
Créez un compte normalement, puis dans le SQL Editor :
`update public.profiles set role = 'admin' where username = 'VOTRE_PSEUDO';`

## Remplacer les démonstrations
Les fiches de démo ont `is_demo = true`. Une fois le panel admin disponible, supprimez-les depuis l'interface. D'ici là : `delete from public.lineups where is_demo;`

## Déploiement Vercel
1. Poussez le dossier sur GitHub.
2. Vercel > Add New Project > importez le dépôt.
3. Ajoutez les 3 variables de `.env.example` (NEXT_PUBLIC_SITE_URL = l'URL Vercel).
4. Deploy. Vérifiez ensuite : accueil, `/lineups`, une fiche, `/sitemap.xml`, `/robots.txt`.
