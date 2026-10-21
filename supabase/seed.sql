-- Données de démonstration. AUCUN point de lancer réel : tout est à compléter par un admin.
insert into public.zones (name, slug, sort_order) values
  ('Zone A (exemple)', 'zone-a', 1), ('Zone B (exemple)', 'zone-b', 2), ('Zone C (exemple)', 'zone-c', 3)
on conflict do nothing;

with z as (select slug, id from public.zones)
insert into public.lineups (title, slug, description, category, difficulty, throw_type, start_zone_id, target_zone_id, status, is_demo, tags)
select v.title, v.slug,
  'Démonstration — à compléter. Cette fiche est un exemple non vérifié : aucun point de départ ni repère réel n''est renseigné.',
  v.cat::lineup_category, v.diff::lineup_difficulty, v.tt, s.id, t.id, 'approved', true, array['démonstration']
from (values
  ('Démonstration — Smoke 1', 'demo-smoke-1', 'smoke', 'easy',   'standard', 'zone-a', 'zone-b'),
  ('Démonstration — Smoke 2', 'demo-smoke-2', 'smoke', 'medium', 'jump',     'zone-b', 'zone-c'),
  ('Démonstration — Flash 1', 'demo-flash-1', 'flash', 'easy',   'standard', 'zone-a', 'zone-c'),
  ('Démonstration — Flash 2', 'demo-flash-2', 'flash', 'hard',   'run',      'zone-c', 'zone-a'),
  ('Démonstration — Frag 1',  'demo-frag-1',  'frag',  'medium', 'standard', 'zone-b', 'zone-a'),
  ('Démonstration — Frag 2',  'demo-frag-2',  'frag',  'hard',   'jump',     'zone-c', 'zone-b')
) as v(title, slug, cat, diff, tt, sz, tz)
join z s on s.slug = v.sz join z t on t.slug = v.tz
on conflict (slug) do nothing;

insert into public.lineup_steps (lineup_id, step_number, title, instructions)
select l.id, st.n, st.title, 'À compléter : ' || st.hint
from public.lineups l
cross join (values
  (1, 'Se rendre au point de départ', 'décrire le lieu de départ.'),
  (2, 'Se positionner', 'indiquer la position exacte, avec capture.'),
  (3, 'Repérer l''élément de référence', 'décrire le repère visuel, avec capture.'),
  (4, 'Orienter le viseur', 'indiquer où placer le viseur.'),
  (5, 'Effectuer le lancer', 'préciser la méthode (clic, saut, course).'),
  (6, 'Vérifier l''impact', 'décrire le résultat attendu, avec capture.')
) as st(n, title, hint)
where l.is_demo
on conflict (lineup_id, step_number) do nothing;
