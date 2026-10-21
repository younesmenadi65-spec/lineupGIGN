export type Category = 'smoke' | 'flash' | 'frag';
export type Difficulty = 'easy' | 'medium' | 'hard';
export const CATEGORIES: Category[] = ['smoke', 'flash', 'frag'];
export const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];
export const CATEGORY_LABEL: Record<Category, string> = { smoke: 'Smoke', flash: 'Flash', frag: 'Frag' };
export const DIFFICULTY_LABEL: Record<Difficulty, string> = { easy: 'Facile', medium: 'Intermédiaire', hard: 'Difficile' };

export type Zone = { id: string; name: string; slug: string };
export type Step = { id: string; step_number: number; title: string; instructions: string; image_url: string | null; video_url: string | null };
export type Lineup = {
  id: string; title: string; slug: string; description: string;
  category: Category; difficulty: Difficulty; throw_type: string | null;
  thumbnail_url: string | null; video_url: string | null; map_version: string | null; tags: string[];
  verified: boolean; verified_at: string | null; is_demo: boolean; view_count: number;
  created_at: string; updated_at: string;
  start_zone: { name: string; slug: string } | null;
  target_zone: { name: string; slug: string } | null;
  author: { username: string } | null;
};
