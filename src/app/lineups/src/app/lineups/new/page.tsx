import { CATEGORIES, CATEGORY_LABEL, DIFFICULTIES, DIFFICULTY_LABEL } from '@/lib/types';
import { createLineup } from './actions';

export const dynamic = 'force-dynamic';

export default function NewLineupPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-4xl font-bold mb-2">Ajouter une Lineup</h1>
      <p className="text-muted mb-8">Partagez votre meilleur lancer avec une image explicative.</p>

      {/* Note importante : encType="multipart/form-data" est obligatoire pour envoyer des fichiers */}
      <form action={createLineup} className="space-y-6 bg-panel p-6 rounded-lg border border-line">
        
        {/* Titre */}
        <div>
          <label className="block text-sm font-semibold mb-2" htmlFor="title">Titre de la lineup</label>
          <input 
            type="text" 
            id="title" 
            name="title" 
            required 
            placeholder="Ex: Smoke A depuis le spawn T"
            className="w-full rounded border border-line bg-background px-4 py-2 text-ink focus:border-accent outline-none"
          />
        </div>

        {/* Catégorie & Difficulté */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2" htmlFor="category">Catégorie</label>
            <select 
              id="category" 
              name="category" 
              required
              className="w-full rounded border border-line bg-background px-4 py-2 text-ink focus:border-accent outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" htmlFor="difficulty">Difficulté</label>
            <select 
              id="difficulty" 
              name="difficulty" 
              required
              className="w-full rounded border border-line bg-background px-4 py-2 text-ink focus:border-accent outline-none"
            >
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>{DIFFICULTY_LABEL[d]}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Type de lancer */}
        <div>
          <label className="block text-sm font-semibold mb-2" htmlFor="throw_type">Type de lancer</label>
          <input 
            type="text" 
            id="throw_type" 
            name="throw_type" 
            placeholder="Ex: Jumpthrow"
            className="w-full rounded border border-line bg-background px-4 py-2 text-ink focus:border-accent outline-none"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold mb-2" htmlFor="description">Description et explications</label>
          <textarea 
            id="description" 
            name="description" 
            rows={4}
            required 
            placeholder="Expliquez brièvement le positionnement..."
            className="w-full rounded border border-line bg-background px-4 py-2 text-ink focus:border-accent outline-none"
          />
        </div>

        {/* Input pour uploader une image directement */}
        <div>
          <label className="block text-sm font-semibold mb-2" htmlFor="image">Image de la lineup (Capture d'écran)</label>
          <input 
            type="file" 
            id="image" 
            name="image" 
            accept="image/*"
            className="w-full rounded border border-line bg-background px-4 py-2 text-ink file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-ink hover:file:opacity-90 cursor-pointer"
          />
          <p className="text-xs text-muted mt-1">Formats acceptés : PNG, JPG, WEBP</p>
        </div>

        {/* Bouton de soumission */}
        <div className="pt-4">
          <button 
            type="submit" 
            className="w-full rounded bg-accent py-3 font-semibold text-ink transition-opacity hover:opacity-90"
          >
            Publier la lineup
          </button>
        </div>

      </form>
    </main>
  );
}
