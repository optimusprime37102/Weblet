import type { SQLiteDatabase } from 'expo-sqlite';

/** Bump when making incompatible schema changes. */
export const DATABASE_VERSION = 2;

export const SCHEMA_SQL = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS app_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  theme_mode TEXT NOT NULL DEFAULT 'system'
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  icon TEXT,
  is_system INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS lite_apps (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  url_key TEXT NOT NULL UNIQUE,
  favicon TEXT,
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  pinned INTEGER NOT NULL DEFAULT 0,
  last_opened_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_lite_apps_created ON lite_apps(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lite_apps_sort ON lite_apps(pinned DESC, sort_order ASC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lite_apps_category ON lite_apps(category_id);
CREATE INDEX IF NOT EXISTS idx_lite_apps_name ON lite_apps(name COLLATE NOCASE);

CREATE TABLE IF NOT EXISTS lite_app_settings (
  lite_app_id TEXT PRIMARY KEY NOT NULL REFERENCES lite_apps(id) ON DELETE CASCADE,
  website_mode TEXT NOT NULL DEFAULT 'mobile',
  theme TEXT NOT NULL DEFAULT 'follow',
  external_links TEXT NOT NULL DEFAULT 'browser',
  full_screen_mode INTEGER NOT NULL DEFAULT 0,
  cookies_enabled INTEGER NOT NULL DEFAULT 1,
  clear_data_on_close INTEGER NOT NULL DEFAULT 0,
  block_third_party_cookies INTEGER NOT NULL DEFAULT 0,
  data_saver_enabled INTEGER NOT NULL DEFAULT 0,
  block_images INTEGER NOT NULL DEFAULT 0,
  disable_video_autoplay INTEGER NOT NULL DEFAULT 0,
  reduce_heavy_content INTEGER NOT NULL DEFAULT 0,
  auto_refresh_enabled INTEGER NOT NULL DEFAULT 0,
  auto_refresh_interval INTEGER NOT NULL DEFAULT 60
);

CREATE TABLE IF NOT EXISTS bookmarks (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  url_key TEXT NOT NULL UNIQUE,
  favicon TEXT,
  lite_app_id TEXT REFERENCES lite_apps(id) ON DELETE SET NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_created ON bookmarks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookmarks_title ON bookmarks(title COLLATE NOCASE);

CREATE TABLE IF NOT EXISTS catalog_apps (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  url_key TEXT NOT NULL,
  favicon TEXT,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_featured INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_catalog_category ON catalog_apps(category_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_catalog_name ON catalog_apps(name COLLATE NOCASE);
CREATE UNIQUE INDEX IF NOT EXISTS idx_catalog_url_category ON catalog_apps(category_id, url_key);

CREATE TABLE IF NOT EXISTS browse_history (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT,
  url TEXT NOT NULL,
  url_key TEXT NOT NULL,
  favicon TEXT,
  lite_app_id TEXT REFERENCES lite_apps(id) ON DELETE SET NULL,
  visited_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_history_visited ON browse_history(visited_at DESC);
CREATE INDEX IF NOT EXISTS idx_history_url ON browse_history(url_key);
`;

export async function applySchema(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(SCHEMA_SQL);
}

export async function getUserVersion(db: SQLiteDatabase): Promise<number> {
  const row = await db.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version'
  );
  return row?.user_version ?? 0;
}

export async function setUserVersion(
  db: SQLiteDatabase,
  version: number
): Promise<void> {
  await db.execAsync(`PRAGMA user_version = ${version}`);
}

/** Incremental upgrades for existing installs (CREATE IF NOT EXISTS alone won't alter columns). */
export async function migrateSchema(
  db: SQLiteDatabase,
  fromVersion: number
): Promise<void> {
  if (fromVersion < 2) {
    try {
      await db.execAsync(
        `ALTER TABLE lite_app_settings ADD COLUMN full_screen_mode INTEGER NOT NULL DEFAULT 0`
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      // Already migrated / column present (e.g. interrupted upgrade).
      if (!/duplicate column/i.test(message)) throw error;
    }
  }
}
