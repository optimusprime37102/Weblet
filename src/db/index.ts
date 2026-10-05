import { getDb } from './client';
import * as liteAppsRepo from './liteApps';
import * as bookmarksRepo from './bookmarks';
import * as settingsRepo from './settings';
import * as historyRepo from './history';
import * as categoriesRepo from './categories';
import { getCatalogSections as getCatalogSectionsDb } from './seedCatalog';
import type {
  AppSettings,
  Bookmark,
  BrowseHistoryEntry,
  CatalogSection,
  Category,
  LiteApp,
  ThemeMode,
} from '@/types';
import { normalizeUrl } from '@/utils/url';

export const db = {
  async init(): Promise<void> {
    await getDb();
  },

  async getLiteApps(): Promise<LiteApp[]> {
    return liteAppsRepo.listLiteApps(await getDb());
  },

  async addLiteApp(input: {
    name?: string;
    url: string;
    categoryId?: string | null;
  }): Promise<LiteApp | null> {
    const url = normalizeUrl(input.url);
    if (!url) return null;
    return liteAppsRepo.insertLiteApp(await getDb(), {
      name: input.name,
      url,
      categoryId: input.categoryId,
    });
  },

  async removeLiteApp(id: string): Promise<void> {
    await liteAppsRepo.deleteLiteApp(await getDb(), id);
  },

  async updateLiteApp(
    id: string,
    patch: Partial<LiteApp>
  ): Promise<LiteApp | null> {
    const next = { ...patch };
    if (typeof next.url === 'string') {
      const url = normalizeUrl(next.url);
      if (!url) return null;
      next.url = url;
    }
    return liteAppsRepo.updateLiteApp(await getDb(), id, next);
  },

  async touchLiteAppOpened(id: string): Promise<void> {
    await liteAppsRepo.touchLiteAppOpened(await getDb(), id);
  },

  async searchLiteApps(query: string): Promise<LiteApp[]> {
    return liteAppsRepo.searchLiteApps(await getDb(), query);
  },

  async getBookmarks(): Promise<Bookmark[]> {
    return bookmarksRepo.listBookmarks(await getDb());
  },

  async addBookmark(input: {
    title?: string;
    url: string;
    liteAppId?: string | null;
  }): Promise<Bookmark | null> {
    const url = normalizeUrl(input.url);
    if (!url) return null;
    return bookmarksRepo.insertBookmark(await getDb(), {
      title: input.title,
      url,
      liteAppId: input.liteAppId,
    });
  },

  async removeBookmark(id: string): Promise<void> {
    await bookmarksRepo.deleteBookmark(await getDb(), id);
  },

  async searchBookmarks(query: string): Promise<Bookmark[]> {
    return bookmarksRepo.searchBookmarks(await getDb(), query);
  },

  async getSettings(): Promise<AppSettings> {
    return settingsRepo.getAppSettings(await getDb());
  },

  async setThemeMode(mode: ThemeMode): Promise<void> {
    await settingsRepo.setAppSettings(await getDb(), { themeMode: mode });
  },

  async getCategories(): Promise<Category[]> {
    return categoriesRepo.listCategories(await getDb());
  },

  async getCatalogSections(query = ''): Promise<CatalogSection[]> {
    return getCatalogSectionsDb(await getDb(), query);
  },

  async recordHistory(input: {
    title?: string;
    url: string;
    liteAppId?: string | null;
  }): Promise<void> {
    const url = normalizeUrl(input.url);
    if (!url) return;
    await historyRepo.recordBrowseHistory(await getDb(), {
      ...input,
      url,
    });
  },

  async getHistory(limit = 100): Promise<BrowseHistoryEntry[]> {
    return historyRepo.listBrowseHistory(await getDb(), limit);
  },

  async clearAllUserData(): Promise<void> {
    const database = await getDb();
    await database.withTransactionAsync(async () => {
      await liteAppsRepo.clearLiteApps(database);
      await bookmarksRepo.clearBookmarks(database);
      await historyRepo.clearBrowseHistory(database);
      await settingsRepo.resetAppSettings(database);
    });
  },
};

export type { CatalogSection, CatalogApp } from '@/types';
