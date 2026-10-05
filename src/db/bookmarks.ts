import type { SQLiteDatabase } from 'expo-sqlite';
import type { Bookmark } from '@/types';
import { getFaviconUrl } from '@/services/favicon';
import { createId } from '@/utils/id';
import { getDisplayNameFromUrl } from '@/utils/url';
import { toUrlKey } from './helpers';

type BookmarkRow = {
  id: string;
  title: string;
  url: string;
  favicon: string | null;
  lite_app_id: string | null;
  created_at: number;
};

function mapBookmark(row: BookmarkRow): Bookmark {
  return {
    id: row.id,
    title: row.title,
    url: row.url,
    favicon: row.favicon ?? undefined,
    createdAt: row.created_at,
    liteAppId: row.lite_app_id ?? undefined,
  };
}

export async function listBookmarks(db: SQLiteDatabase): Promise<Bookmark[]> {
  const rows = await db.getAllAsync<BookmarkRow>(
    'SELECT * FROM bookmarks ORDER BY created_at DESC'
  );
  return rows.map(mapBookmark);
}

export async function findBookmarkByUrl(
  db: SQLiteDatabase,
  url: string
): Promise<Bookmark | null> {
  const row = await db.getFirstAsync<BookmarkRow>(
    'SELECT * FROM bookmarks WHERE url_key = ?',
    toUrlKey(url)
  );
  return row ? mapBookmark(row) : null;
}

export async function insertBookmark(
  db: SQLiteDatabase,
  input: {
    title?: string;
    url: string;
    favicon?: string;
    liteAppId?: string | null;
  }
): Promise<Bookmark> {
  const existing = await findBookmarkByUrl(db, input.url);
  if (existing) return existing;

  const id = createId('bm');
  const title = input.title?.trim() || getDisplayNameFromUrl(input.url);
  const favicon = input.favicon || getFaviconUrl(input.url);
  const createdAt = Date.now();

  await db.runAsync(
    `INSERT INTO bookmarks (id, title, url, url_key, favicon, lite_app_id, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    id,
    title,
    input.url,
    toUrlKey(input.url),
    favicon,
    input.liteAppId ?? null,
    createdAt
  );

  return {
    id,
    title,
    url: input.url,
    favicon,
    createdAt,
    liteAppId: input.liteAppId ?? undefined,
  };
}

export async function deleteBookmark(
  db: SQLiteDatabase,
  id: string
): Promise<void> {
  await db.runAsync('DELETE FROM bookmarks WHERE id = ?', id);
}

export async function clearBookmarks(db: SQLiteDatabase): Promise<void> {
  await db.runAsync('DELETE FROM bookmarks');
}

export async function searchBookmarks(
  db: SQLiteDatabase,
  query: string
): Promise<Bookmark[]> {
  const q = query.trim().toLowerCase();
  if (!q) return listBookmarks(db);

  const rows = await db.getAllAsync<BookmarkRow>(
    `SELECT * FROM bookmarks
     WHERE lower(title) LIKE ? OR lower(url) LIKE ?
     ORDER BY created_at DESC`,
    `%${q}%`,
    `%${q}%`
  );
  return rows.map(mapBookmark);
}
