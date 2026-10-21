import type { Category } from '@/lib/types';

export const CATEGORY_TEXT: Record<Category, string> = { smoke: 'text-smoke', flash: 'text-flash', frag: 'text-frag' };

export function CategoryIcon({ category, className = 'h-6 w-6' }: { category: Category; className?: string }) {
  const p = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, className, 'aria-hidden': true };
  if (category === 'smoke') return <svg {...p}><path d="M7 18a4 4 0 0 1-.5-7.97A5.5 5.5 0 0 1 17 8.5a4.75 4.75 0 0 1 .5 9.5H7Z" /></svg>;
  if (category === 'flash') return <svg {...p}><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" /></svg>;
  return <svg {...p}><circle cx="12" cy="14" r="7" /><path d="M9 7V4h6v3M12 4V2M9.5 12.5l5 5M14.5 12.5l-5 5" /></svg>;
}
