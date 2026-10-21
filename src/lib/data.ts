import { createClient, isConfigured } from '@/lib/supabase/server';
import { CATEGORIES, DIFFICULTIES, type Lineup, type Step, type Zone } from '@/lib/types';

const SELECT = '*, start_zone:zones!lineups_start_zone_fk(name,slug), target_zone:zones!lineups_target_zone_fk(name,slug), author:profiles!lineups_author_fk(username)';
export const PAGE_SIZE = 12;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function safe<T>(fallback: T, fn: () => Promise<T>): Promise<T> {
  if (!isConfigured) return fallback;
  try { return await fn(); } catch (e) { console.error(e); return fallback; }
}

export type Filters = { q?: string; category?: string; difficulty?: string; zone?: string; throwType?: string; sort?: string; page?: number };

export function getStats() {
  return safe({ total: 0, smoke: 0, flash: 0, frag: 0 }, async () => {
    const db = await createClient();
    const count = async (cat?: string) => {
      let q = db.from('lineups').select('id', { count: 'exact', head: true }).eq('status', 'approved');
      if (cat) q = q.eq('category', cat);
      return (await q).count ?? 0;
    };
    const [total, smoke, flash, frag] = await Promise.all([count(), count('smoke'), count('flash'), count('frag')]);
    return { total, smoke, flash, frag };
  });
}

export function getLineups(f: Filters) {
  return safe({ items: [] as Lineup[], total: 0 }, async () => {
    const db = await createClient();
    const page = Math.max(1, f.page ?? 1);
    let q = db.from('lineups').select(SELECT, { count: 'exact' }).eq('status', 'approved');
    const term = f.q?.replace(/[%,()*\\]/g, ' ').trim();
    if (term) q = q.ilike('title', `%${term}%`);
    if (f.category && (CATEGORIES as string[]).includes(f.category)) q = q.eq('category', f.category);
    if (f.difficulty && (DIFFICULTIES as string[]).includes(f.difficulty)) q = q.eq('difficulty', f.difficulty);
    if (f.zone && UUID.test(f.zone)) q = q.or(`start_zone_id.eq.${f.zone},target_zone_id.eq.${f.zone}`);
    if (f.throwType) q = q.eq('throw_type', f.throwType);
    if (f.sort === 'difficulty') q = q.order('difficulty_rank', { ascending: true }).order('created_at', { ascending: false });
    else if (f.sort === 'popular') q = q.order('view_count', { ascending: false }).order('created_at', { ascending: false });
    else q = q.order('created_at', { ascending: false });
    const { data, count, error } = await q.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
    if (error) throw error;
    return { items: (data ?? []) as unknown as Lineup[], total: count ?? 0 };
  });
}

export const getPopular = () => safe([] as Lineup[], async () => {
  const db = await createClient();
  const { data } = await db.from('lineups').select(SELECT).eq('status', 'approved').order('view_count', { ascending: false }).limit(3);
  return (data ?? []) as unknown as Lineup[];
});

export const getLatest = () => safe([] as Lineup[], async () => {
  const db = await createClient();
  const { data } = await db.from('lineups').select(SELECT).eq('status', 'approved').order('created_at', { ascending: false }).limit(3);
  return (data ?? []) as unknown as Lineup[];
});

export const getZones = () => safe([] as Zone[], async () => {
  const db = await createClient();
  const { data } = await db.from('zones').select('id,name,slug').order('sort_order');
  return (data ?? []) as Zone[];
});

export const getThrowTypes = () => safe([] as string[], async () => {
  const db = await createClient();
  const { data } = await db.from('lineups').select('throw_type').eq('status', 'approved').not('throw_type', 'is', null);
  return [...new Set((data ?? []).map((r) => r.throw_type as string))].sort();
});

export const getLineupBySlug = (slug: string) => safe(null as { lineup: Lineup; steps: Step[]; similar: Lineup[] } | null, async () => {
  const db = await createClient();
  const { data } = await db.from('lineups').select(SELECT).eq('slug', slug).eq('status', 'approved').maybeSingle();
  if (!data) return null;
  const lineup = data as unknown as Lineup;
  const [{ data: steps }, { data: similar }] = await Promise.all([
    db.from('lineup_steps').select('id,step_number,title,instructions,image_url,video_url').eq('lineup_id', lineup.id).order('step_number'),
    db.from('lineups').select(SELECT).eq('status', 'approved').eq('category', lineup.category).neq('id', lineup.id).limit(3),
  ]);
  await db.rpc('increment_views', { p_slug: slug });
  return { lineup, steps: (steps ?? []) as Step[], similar: (similar ?? []) as unknown as Lineup[] };
});
