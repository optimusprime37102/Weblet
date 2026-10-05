import type { SQLiteDatabase } from 'expo-sqlite';
import type { AppSettings, ThemeMode } from '@/types';

export async function getAppSettings(db: SQLiteDatabase): Promise<AppSettings> {
  const row = await db.getFirstAsync<{ theme_mode: string }>(
    'SELECT theme_mode FROM app_settings WHERE id = 1'
  );
  return {
    themeMode: (row?.theme_mode as ThemeMode) || 'system',
  };
}

export async function setAppSettings(
  db: SQLiteDatabase,
  settings: AppSettings
): Promise<void> {
  await db.runAsync(
    `INSERT INTO app_settings (id, theme_mode) VALUES (1, ?)
     ON CONFLICT(id) DO UPDATE SET theme_mode = excluded.theme_mode`,
    settings.themeMode
  );
}

export async function resetAppSettings(db: SQLiteDatabase): Promise<void> {
  await setAppSettings(db, { themeMode: 'system' });
}
