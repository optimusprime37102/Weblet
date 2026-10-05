import type { SQLiteDatabase } from 'expo-sqlite';
import type { Category } from '@/types';

export type CategorySeed = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  icon: string;
};

/** System categories for user Lite Apps + ready-made catalog. */
export const CATEGORY_SEED: CategorySeed[] = [
  { id: 'cat_popular', name: 'Popular', slug: 'popular', sortOrder: 10, icon: 'flame-outline' },
  { id: 'cat_social', name: 'Social', slug: 'social', sortOrder: 20, icon: 'people-outline' },
  { id: 'cat_shopping', name: 'Shopping', slug: 'shopping', sortOrder: 30, icon: 'cart-outline' },
  { id: 'cat_work', name: 'Work', slug: 'work', sortOrder: 40, icon: 'briefcase-outline' },
  { id: 'cat_education', name: 'Education', slug: 'education', sortOrder: 50, icon: 'school-outline' },
  { id: 'cat_news', name: 'News', slug: 'news', sortOrder: 60, icon: 'newspaper-outline' },
  { id: 'cat_technology', name: 'Technology', slug: 'technology', sortOrder: 70, icon: 'hardware-chip-outline' },
  { id: 'cat_entertainment', name: 'Entertainment', slug: 'entertainment', sortOrder: 80, icon: 'film-outline' },
  { id: 'cat_finance', name: 'Finance', slug: 'finance', sortOrder: 90, icon: 'cash-outline' },
  { id: 'cat_travel', name: 'Travel', slug: 'travel', sortOrder: 100, icon: 'airplane-outline' },
  { id: 'cat_sports', name: 'Sports', slug: 'sports', sortOrder: 110, icon: 'football-outline' },
  { id: 'cat_health', name: 'Health', slug: 'health', sortOrder: 120, icon: 'fitness-outline' },
  { id: 'cat_games', name: 'Games', slug: 'games', sortOrder: 130, icon: 'game-controller-outline' },
  { id: 'cat_utilities', name: 'Utilities', slug: 'utilities', sortOrder: 140, icon: 'construct-outline' },
];

export const CATEGORY_BY_NAME = Object.fromEntries(
  CATEGORY_SEED.map((c) => [c.name, c])
) as Record<string, CategorySeed>;

export async function ensureCategories(db: SQLiteDatabase): Promise<void> {
  const count = await db.getFirstAsync<{ c: number }>(
    'SELECT COUNT(*) as c FROM categories'
  );
  if ((count?.c ?? 0) > 0) return;

  await db.withTransactionAsync(async () => {
    for (const cat of CATEGORY_SEED) {
      await db.runAsync(
        `INSERT OR IGNORE INTO categories (id, name, slug, sort_order, icon, is_system)
         VALUES (?, ?, ?, ?, ?, 1)`,
        cat.id,
        cat.name,
        cat.slug,
        cat.sortOrder,
        cat.icon
      );
    }
  });
}

export async function listCategories(db: SQLiteDatabase): Promise<Category[]> {
  const rows = await db.getAllAsync<{
    id: string;
    name: string;
    slug: string;
    sort_order: number;
    icon: string | null;
    is_system: number;
  }>('SELECT * FROM categories ORDER BY sort_order ASC, name ASC');

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    sortOrder: row.sort_order,
    icon: row.icon ?? undefined,
    isSystem: row.is_system === 1,
  }));
}
