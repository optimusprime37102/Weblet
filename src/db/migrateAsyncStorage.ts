import type { SQLiteDatabase } from 'expo-sqlite';
import type { LiteApp, LiteAppSettings } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_LITE_APP_SETTINGS } from '@/services/liteAppSettings';
import { getFaviconUrl } from '@/services/favicon';
import { boolToInt, toUrlKey } from './helpers';

const META_MIGRATED = 'async_storage_migrated_v1';

const LEGACY_KEYS = {
  liteApps: '@weblet/liteApps',
  bookmarks: '@weblet/bookmarks',
  settings: '@weblet/settings',
  clearedSeededApps: '@weblet/clearedSeededApps',
} as const;

async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

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

/**
 * One-time import from the previous AsyncStorage persistence layer.
 */
export async function migrateFromAsyncStorage(
  db: SQLiteDatabase
): Promise<void> {
  const flag = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM meta WHERE key = ?',
    META_MIGRATED
  );
  if (flag?.value === '1') return;

  const [apps, bookmarks, settings, clearedSeeded] = await Promise.all([
    readJson<LiteApp[]>(LEGACY_KEYS.liteApps, []),
    readJson<
      Array<{
        id: string;
        title: string;
        url: string;
        favicon?: string;
        createdAt: number;
      }>
    >(LEGACY_KEYS.bookmarks, []),
    readJson<{ themeMode?: string }>(LEGACY_KEYS.settings, { themeMode: 'system' }),
    AsyncStorage.getItem(LEGACY_KEYS.clearedSeededApps),
  ]);

  // Preserve old one-time wipe of leftover seeded apps.
  const liteApps = clearedSeeded === '1' ? apps : [];

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT INTO app_settings (id, theme_mode) VALUES (1, ?)
       ON CONFLICT(id) DO UPDATE SET theme_mode = excluded.theme_mode`,
      settings.themeMode === 'light' ||
        settings.themeMode === 'dark' ||
        settings.themeMode === 'system'
        ? settings.themeMode
        : 'system'
    );

    for (const app of liteApps) {
      const now = app.createdAt || Date.now();
      const settingsMerged: LiteAppSettings = {
        ...DEFAULT_LITE_APP_SETTINGS,
        ...app.settings,
      };

      await db.runAsync(
        `INSERT OR IGNORE INTO lite_apps
          (id, name, url, url_key, favicon, category_id, sort_order, pinned, last_opened_at, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, NULL, 0, 0, NULL, ?, ?)`,
        app.id,
        app.name,
        app.url,
        toUrlKey(app.url),
        app.favicon || getFaviconUrl(app.url),
        now,
        now
      );
      await insertSettings(db, app.id, settingsMerged);
    }

    for (const bookmark of bookmarks) {
      await db.runAsync(
        `INSERT OR IGNORE INTO bookmarks
          (id, title, url, url_key, favicon, lite_app_id, created_at)
         VALUES (?, ?, ?, ?, ?, NULL, ?)`,
        bookmark.id,
        bookmark.title,
        bookmark.url,
        toUrlKey(bookmark.url),
        bookmark.favicon || getFaviconUrl(bookmark.url),
        bookmark.createdAt || Date.now()
      );
    }

    await db.runAsync(
      'INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)',
      META_MIGRATED,
      '1'
    );
  });

  // Legacy keys are no longer the source of truth.
  try {
    await AsyncStorage.multiRemove([
      LEGACY_KEYS.liteApps,
      LEGACY_KEYS.bookmarks,
      LEGACY_KEYS.settings,
      LEGACY_KEYS.clearedSeededApps,
      '@weblet/seeded',
    ]);
  } catch {
    // ignore cleanup failures
  }
}
