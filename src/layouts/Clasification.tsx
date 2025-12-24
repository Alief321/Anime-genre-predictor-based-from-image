import { AnimeGenrePredictor } from '../components/AnimeGenrePredictor';

export function Clasification() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-4 sm:p-8">
      <div className="mx-auto max-w-6xl">
        <AnimeGenrePredictor />
      </div>
    </main>
  );
}
