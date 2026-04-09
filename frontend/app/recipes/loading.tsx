import { SkeletonHero, SkeletonRecipeGrid } from '../../components/Skeleton';

export default function RecipesLoading() {
  return (
    <main className="min-h-screen px-6 py-12 max-w-6xl mx-auto">
      <SkeletonHero />
      <SkeletonRecipeGrid count={6} />
    </main>
  );
}
