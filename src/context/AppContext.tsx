import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';
import type { AppSettings, Bookmark, LiteApp, ThemeMode } from '@/types';
import { lightColors, darkColors, type AppColors } from '@/theme';
import { storage } from '@/services/storage';
import { createSeedLiteApps } from '@/services/seed';
import { getFaviconUrl } from '@/services/favicon';
import { createId } from '@/utils/id';
import { getDisplayNameFromUrl, normalizeUrl } from '@/utils/url';

type AppContextValue = {
  ready: boolean;
  colors: AppColors;
  isDark: boolean;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  liteApps: LiteApp[];
  bookmarks: Bookmark[];
  addLiteApp: (input: { name?: string; url: string }) => Promise<LiteApp | null>;
  removeLiteApp: (id: string) => Promise<void>;
  updateLiteApp: (id: string, patch: Partial<LiteApp>) => Promise<void>;
  addBookmark: (input: { title?: string; url: string }) => Promise<Bookmark | null>;
  removeBookmark: (id: string) => Promise<void>;
  clearAllData: () => Promise<void>;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [ready, setReady] = useState(false);
  const [liteApps, setLiteApps] = useState<LiteApp[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ themeMode: 'system' });
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const [apps, marks, savedSettings, seeded] = await Promise.all([
        storage.getLiteApps(),
        storage.getBookmarks(),
        storage.getSettings(),
        storage.getSeeded(),
      ]);

      let nextApps = apps;
      if (!seeded && apps.length === 0) {
        nextApps = createSeedLiteApps();
        await storage.setLiteApps(nextApps);
        await storage.setSeeded();
      }

      if (!mounted) return;
      setLiteApps(nextApps);
      setBookmarks(marks);
      setSettings(savedSettings);
      setReady(true);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const isDark =
    settings.themeMode === 'dark' ||
    (settings.themeMode === 'system' && systemScheme === 'dark');
  const colors = isDark ? darkColors : lightColors;

  const persistApps = useCallback(async (next: LiteApp[]) => {
    setLiteApps(next);
    await storage.setLiteApps(next);
  }, []);

  const persistBookmarks = useCallback(async (next: Bookmark[]) => {
    setBookmarks(next);
    await storage.setBookmarks(next);
  }, []);

  const addLiteApp = useCallback(
    async (input: { name?: string; url: string }) => {
      const url = normalizeUrl(input.url);
      if (!url) return null;

      const exists = liteApps.some(
        (app) => app.url.replace(/\/$/, '') === url.replace(/\/$/, '')
      );
      if (exists) {
        return liteApps.find(
          (app) => app.url.replace(/\/$/, '') === url.replace(/\/$/, '')
        )!;
      }

      const app: LiteApp = {
        id: createId('app'),
        name: input.name?.trim() || getDisplayNameFromUrl(url),
        url,
        favicon: getFaviconUrl(url),
        createdAt: Date.now(),
      };

      await persistApps([app, ...liteApps]);
      return app;
    },
    [liteApps, persistApps]
  );

  const removeLiteApp = useCallback(
    async (id: string) => {
      await persistApps(liteApps.filter((app) => app.id !== id));
    },
    [liteApps, persistApps]
  );

  const updateLiteApp = useCallback(
    async (id: string, patch: Partial<LiteApp>) => {
      await persistApps(
        liteApps.map((app) => (app.id === id ? { ...app, ...patch } : app))
      );
    },
    [liteApps, persistApps]
  );

  const addBookmark = useCallback(
    async (input: { title?: string; url: string }) => {
      const url = normalizeUrl(input.url);
      if (!url) return null;

      const exists = bookmarks.some(
        (b) => b.url.replace(/\/$/, '') === url.replace(/\/$/, '')
      );
      if (exists) {
        return bookmarks.find(
          (b) => b.url.replace(/\/$/, '') === url.replace(/\/$/, '')
        )!;
      }

      const bookmark: Bookmark = {
        id: createId('bm'),
        title: input.title?.trim() || getDisplayNameFromUrl(url),
        url,
        favicon: getFaviconUrl(url),
        createdAt: Date.now(),
      };

      await persistBookmarks([bookmark, ...bookmarks]);
      return bookmark;
    },
    [bookmarks, persistBookmarks]
  );

  const removeBookmark = useCallback(
    async (id: string) => {
      await persistBookmarks(bookmarks.filter((b) => b.id !== id));
    },
    [bookmarks, persistBookmarks]
  );

  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    const next = { themeMode: mode };
    setSettings(next);
    await storage.setSettings(next);
  }, []);

  const clearAllData = useCallback(async () => {
    await storage.clearAll();
    const seeded = createSeedLiteApps();
    await storage.setLiteApps(seeded);
    await storage.setSeeded();
    setLiteApps(seeded);
    setBookmarks([]);
    setSettings({ themeMode: 'system' });
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      ready,
      colors,
      isDark,
      themeMode: settings.themeMode,
      setThemeMode,
      liteApps,
      bookmarks,
      addLiteApp,
      removeLiteApp,
      updateLiteApp,
      addBookmark,
      removeBookmark,
      clearAllData,
      drawerOpen,
      setDrawerOpen,
    }),
    [
      ready,
      colors,
      isDark,
      settings.themeMode,
      setThemeMode,
      liteApps,
      bookmarks,
      addLiteApp,
      removeLiteApp,
      updateLiteApp,
      addBookmark,
      removeBookmark,
      clearAllData,
      drawerOpen,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within AppProvider');
  }
  return ctx;
}
