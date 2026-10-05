/**
 * Catalog helpers — data lives in SQLite (`src/db`) with an in-memory cache
 * so Ready-made opens without waiting on disk during transitions.
 */
import { db } from '@/db';
import type { CatalogApp, CatalogSection } from '@/types';

export type { CatalogApp, CatalogSection };

const cache = new Map<string, CatalogSection[]>();
let prefetchPromise: Promise<CatalogSection[]> | null = null;

function cacheKey(query: string): string {
  return query.trim().toLowerCase();
}

export async function getCatalogSections(
  query = ''
): Promise<CatalogSection[]> {
  const key = cacheKey(query);
  const hit = cache.get(key);
  if (hit) return hit;

  const sections = await db.getCatalogSections(query);
  cache.set(key, sections);
  return sections;
}

/** Warm the empty-query catalog as soon as the DB is ready. */
export function prefetchCatalog(): Promise<CatalogSection[]> {
  if (prefetchPromise) return prefetchPromise;
  const cached = cache.get('');
  if (cached) {
    prefetchPromise = Promise.resolve(cached);
    return prefetchPromise;
  }
  prefetchPromise = getCatalogSections('').catch((error) => {
    prefetchPromise = null;
    throw error;
  });
  return prefetchPromise;
}

export function getCachedCatalogSections(query = ''): CatalogSection[] | null {
  return cache.get(cacheKey(query)) ?? null;
}

export function invalidateCatalogCache(): void {
  cache.clear();
  prefetchPromise = null;
}
