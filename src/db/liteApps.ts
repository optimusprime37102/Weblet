import type { SQLiteDatabase } from 'expo-sqlite';
import type { LiteApp, LiteAppSettings } from '@/types';
import { DEFAULT_LITE_APP_SETTINGS } from '@/services/liteAppSettings';
import { getFaviconUrl } from '@/services/favicon';
import { createId } from '@/utils/id';
import { getDisplayNameFromUrl } from '@/utils/url';
import { boolToInt, toUrlKey } from './helpers';
import { mapLiteAppRow, type LiteAppRow } from './mappers';

const LITE_APP_SELECT = `
  SELECT
    a.id, a.name, a.url, a.url_key, a.favicon, a.category_id, a.sort_order,
    a.pinned, a.last_opened_at, a.created_at, a.updated_at,
    s.website_mode, s.theme, s.external_links, s.full_screen_mode,
    s.cookies_enabled, s.clear_data_on_close, s.block_third_party_cookies,
    s.data_saver_enabled, s.block_images, s.disable_video_autoplay,
    s.reduce_heavy_content, s.auto_refresh_enabled, s.auto_refresh_interval
  FROM lite_apps a
  LEFT JOIN lite_app_settings s ON s.lite_app_id = a.id
`;

async function insertSettings(
  db: SQLiteDatabase,
  liteAppId: string,
  settings: LiteAppSettings
): Promise<void> {
  await db.runAsync(
    `INSERT OR REPLACE INTO lite_app_settings (
      lite_app_id, website_mode, theme, external_links, full_screen_mode,
      cookies_enabled, clear_data_on_close, block_third_party_cookies,
      data_saver_enabled, block_images, disable_video_autoplay,
      reduce_heavy_content, auto_refresh_enabled, auto_refresh_interval
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    liteAppId,
    settings.websiteMode,
    settings.theme,
    settings.externalLinks,
    boolToInt(settings.fullScreenMode),
    boolToInt(settings.cookiesEnabled),
    boolToInt(settings.clearDataOnClose),
    boolToInt(settings.blockThirdPartyCookies),
    boolToInt(settings.dataSaverEnabled),
    boolToInt(settings.blockImages),
    boolToInt(settings.disableVideoAutoplay),
    boolToInt(settings.reduceHeavyContent),
    boolToInt(settings.autoRefreshEnabled),
    settings.autoRefreshInterval
  );
}

export async function listLiteApps(db: SQLiteDatabase): Promise<LiteApp[]> {
  const rows = await db.getAllAsync<LiteAppRow>(
    `${LITE_APP_SELECT}
     ORDER BY a.pinned DESC, a.sort_order ASC, a.created_at DESC`
  );
  return rows.map(mapLiteAppRow);
}

export async function getLiteAppById(
  db: SQLiteDatabase,
  id: string
): Promise<LiteApp | null> {
  const row = await db.getFirstAsync<LiteAppRow>(
    `${LITE_APP_SELECT} WHERE a.id = ?`,
    id
  );
  return row ? mapLiteAppRow(row) : null;
}

export async function findLiteAppByUrl(
  db: SQLiteDatabase,
  url: string
): Promise<LiteApp | null> {
  const row = await db.getFirstAsync<LiteAppRow>(
    `${LITE_APP_SELECT} WHERE a.url_key = ?`,
    toUrlKey(url)
  );
  return row ? mapLiteAppRow(row) : null;
}

export async function insertLiteApp(
  db: SQLiteDatabase,
  input: {
    name?: string;
    url: string;
    categoryId?: string | null;
    favicon?: string;
    settings?: LiteAppSettings;
  }
): Promise<LiteApp> {
  const existing = await findLiteAppByUrl(db, input.url);
  if (existing) return existing;

  const now = Date.now();
  const id = createId('app');
  const name = input.name?.trim() || getDisplayNameFromUrl(input.url);
  const favicon = input.favicon || getFaviconUrl(input.url);
  const settings = {
    ...DEFAULT_LITE_APP_SETTINGS,
    ...input.settings,
  };

  const minSort = await db.getFirstAsync<{ m: number | null }>(
    'SELECT MIN(sort_order) as m FROM lite_apps'
  );
  const sortOrder = (minSort?.m ?? 0) - 1;

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT INTO lite_apps
        (id, name, url, url_key, favicon, category_id, sort_order, pinned, last_opened_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0, NULL, ?, ?)`,
      id,
      name,
      input.url,
      toUrlKey(input.url),
      favicon,
      input.categoryId ?? null,
      sortOrder,
      now,
      now
    );
    await insertSettings(db, id, settings);
  });

  const created = await getLiteAppById(db, id);
  if (!created) {
    throw new Error('Failed to create Lite App');
  }
  return created;
}

export async function updateLiteApp(
  db: SQLiteDatabase,
  id: string,
  patch: Partial<LiteApp>
): Promise<LiteApp | null> {
  const current = await getLiteAppById(db, id);
  if (!current) return null;

  const next: LiteApp = {
    ...current,
    ...patch,
    id: current.id,
    settings: patch.settings
      ? {
          ...DEFAULT_LITE_APP_SETTINGS,
          ...current.settings,
          ...patch.settings,
        }
      : current.settings,
  };

  const now = Date.now();
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `UPDATE lite_apps SET
        name = ?, url = ?, url_key = ?, favicon = ?, category_id = ?,
        sort_order = ?, pinned = ?, last_opened_at = ?, updated_at = ?
       WHERE id = ?`,
      next.name,
      next.url,
      toUrlKey(next.url),
      next.favicon ?? null,
      next.categoryId ?? null,
      next.sortOrder ?? 0,
      boolToInt(!!next.pinned),
      next.lastOpenedAt ?? null,
      now,
      id
    );

    if (next.settings) {
      await insertSettings(db, id, next.settings);
    }
  });

  return getLiteAppById(db, id);
}

export async function deleteLiteApp(
  db: SQLiteDatabase,
  id: string
): Promise<void> {
  await db.runAsync('DELETE FROM lite_apps WHERE id = ?', id);
}

export async function touchLiteAppOpened(
  db: SQLiteDatabase,
  id: string
): Promise<void> {
  await db.runAsync(
    'UPDATE lite_apps SET last_opened_at = ?, updated_at = ? WHERE id = ?',
    Date.now(),
    Date.now(),
    id
  );
}

export async function clearLiteApps(db: SQLiteDatabase): Promise<void> {
  await db.runAsync('DELETE FROM lite_apps');
}

export async function searchLiteApps(
  db: SQLiteDatabase,
  query: string,
  limit = 100
): Promise<LiteApp[]> {
  const q = query.trim().toLowerCase();
  if (!q) return listLiteApps(db);

  const rows = await db.getAllAsync<LiteAppRow>(
    `${LITE_APP_SELECT}
     WHERE lower(a.name) LIKE ? OR lower(a.url) LIKE ?
     ORDER BY a.pinned DESC, a.sort_order ASC, a.created_at DESC
     LIMIT ?`,
    `%${q}%`,
    `%${q}%`,
    limit
  );
  return rows.map(mapLiteAppRow);
}
