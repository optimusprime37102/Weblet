import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppSettings, Bookmark, LiteApp } from '@/types';

const KEYS = {
  liteApps: '@weblet/liteApps',
  bookmarks: '@weblet/bookmarks',
  settings: '@weblet/settings',
  seeded: '@weblet/seeded',
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

async function writeJson<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export const storage = {
  getLiteApps: () => readJson<LiteApp[]>(KEYS.liteApps, []),
  setLiteApps: (apps: LiteApp[]) => writeJson(KEYS.liteApps, apps),
  getBookmarks: () => readJson<Bookmark[]>(KEYS.bookmarks, []),
  setBookmarks: (bookmarks: Bookmark[]) => writeJson(KEYS.bookmarks, bookmarks),
  getSettings: () =>
    readJson<AppSettings>(KEYS.settings, { themeMode: 'system' }),
  setSettings: (settings: AppSettings) => writeJson(KEYS.settings, settings),
  getSeeded: async () => (await AsyncStorage.getItem(KEYS.seeded)) === '1',
  setSeeded: async () => {
    await AsyncStorage.setItem(KEYS.seeded, '1');
  },
  getClearedSeededApps: async () =>
    (await AsyncStorage.getItem(KEYS.clearedSeededApps)) === '1',
  setClearedSeededApps: async () => {
    await AsyncStorage.setItem(KEYS.clearedSeededApps, '1');
  },
  clearAll: async () => {
    await AsyncStorage.multiRemove([
      KEYS.liteApps,
      KEYS.bookmarks,
      KEYS.settings,
      KEYS.seeded,
      KEYS.clearedSeededApps,
    ]);
  },
};
