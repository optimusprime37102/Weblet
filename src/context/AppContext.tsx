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
import { db } from '@/db';

type AppContextValue = {
  ready: boolean;
  colors: AppColors;
  isDark: boolean;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  liteApps: LiteApp[];
  bookmarks: Bookmark[];
  addLiteApp: (input: {
    name?: string;
    url: string;
    categoryId?: string | null;
  }) => Promise<LiteApp | null>;
  removeLiteApp: (id: string) => Promise<void>;
  updateLiteApp: (id: string, patch: Partial<LiteApp>) => Promise<void>;
  addBookmark: (input: {
    title?: string;
    url: string;
    liteAppId?: string | null;
  }) => Promise<Bookmark | null>;
  removeBookmark: (id: string) => Promise<void>;
  clearAllData: () => Promise<void>;
  refreshLiteApps: () => Promise<void>;
  refreshBookmarks: () => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [ready, setReady] = useState(false);
  const [liteApps, setLiteApps] = useState<LiteApp[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ themeMode: 'system' });

  const refreshLiteApps = useCallback(async () => {
    setLiteApps(await db.getLiteApps());
  }, []);

  const refreshBookmarks = useCallback(async () => {
    setBookmarks(await db.getBookmarks());
  }, []);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        await db.init();
        const [apps, marks, savedSettings] = await Promise.all([
          db.getLiteApps(),
          db.getBookmarks(),
          db.getSettings(),
        ]);
        if (!mounted) return;
        setLiteApps(apps);
        setBookmarks(marks);
        setSettings(savedSettings);
      } finally {
        if (mounted) setReady(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const isDark =
    settings.themeMode === 'dark' ||
    (settings.themeMode === 'system' && systemScheme === 'dark');
  const colors = isDark ? darkColors : lightColors;

  const addLiteApp = useCallback(
    async (input: {
      name?: string;
      url: string;
      categoryId?: string | null;
    }) => {
      const app = await db.addLiteApp(input);
      if (!app) return null;
      setLiteApps((prev) => {
        if (prev.some((item) => item.id === app.id)) return prev;
        return [app, ...prev];
      });
      return app;
    },
    []
  );

  const removeLiteApp = useCallback(async (id: string) => {
    await db.removeLiteApp(id);
    setLiteApps((prev) => prev.filter((app) => app.id !== id));
  }, []);

  const updateLiteApp = useCallback(
    async (id: string, patch: Partial<LiteApp>) => {
      const updated = await db.updateLiteApp(id, patch);
      if (!updated) return;
      setLiteApps((prev) =>
        prev.map((app) => (app.id === id ? updated : app))
      );
    },
    []
  );

  const addBookmark = useCallback(
    async (input: {
      title?: string;
      url: string;
      liteAppId?: string | null;
    }) => {
      const bookmark = await db.addBookmark(input);
      if (!bookmark) return null;
      setBookmarks((prev) => {
        if (prev.some((item) => item.id === bookmark.id)) return prev;
        return [bookmark, ...prev];
      });
      return bookmark;
    },
    []
  );

  const removeBookmark = useCallback(async (id: string) => {
    await db.removeBookmark(id);
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    const next = { themeMode: mode };
    setSettings(next);
    await db.setThemeMode(mode);
  }, []);

  const clearAllData = useCallback(async () => {
    await db.clearAllUserData();
    setLiteApps([]);
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
      refreshLiteApps,
      refreshBookmarks,
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
      refreshLiteApps,
      refreshBookmarks,
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
