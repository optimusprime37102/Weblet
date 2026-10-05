import type { SQLiteDatabase } from 'expo-sqlite';
import type { BrowseHistoryEntry } from '@/types';
import { getFaviconUrl } from '@/services/favicon';
import { createId } from '@/utils/id';
import { toUrlKey } from './helpers';

const MAX_HISTORY = 500;

type HistoryRow = {
  id: string;
  title: string | null;
  url: string;
  favicon: string | null;
  lite_app_id: string | null;
  visited_at: number;
};

function mapHistory(row: HistoryRow): BrowseHistoryEntry {
  return {
    id: row.id,
    title: row.title ?? undefined,
    url: row.url,
    favicon: row.favicon ?? undefined,
    liteAppId: row.lite_app_id ?? undefined,
    visitedAt: row.visited_at,
  };
}

export async function recordBrowseHistory(
  db: SQLiteDatabase,
  input: {
    title?: string;
    url: string;
    favicon?: string;
    liteAppId?: string | null;
  }
): Promise<void> {
  const urlKey = toUrlKey(input.url);
  const visitedAt = Date.now();

  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM browse_history WHERE url_key = ?', urlKey);
    await db.runAsync(
      `INSERT INTO browse_history (id, title, url, url_key, favicon, lite_app_id, visited_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      createId('hist'),
      input.title ?? null,
      input.url,
      urlKey,
      input.favicon || getFaviconUrl(input.url),
      input.liteAppId ?? null,
      visitedAt
    );

    await db.runAsync(
      `DELETE FROM browse_history
       WHERE visited_at < COALESCE(
         (SELECT visited_at FROM browse_history
          ORDER BY visited_at DESC LIMIT 1 OFFSET ?),
         0
       )`,
      MAX_HISTORY - 1
    );
  });
}

export async function listBrowseHistory(
  db: SQLiteDatabase,
  limit = 100
): Promise<BrowseHistoryEntry[]> {
  const rows = await db.getAllAsync<HistoryRow>(
    'SELECT * FROM browse_history ORDER BY visited_at DESC LIMIT ?',
    limit
  );
  return rows.map(mapHistory);
}

export async function clearBrowseHistory(db: SQLiteDatabase): Promise<void> {
  await db.runAsync('DELETE FROM browse_history');
}
