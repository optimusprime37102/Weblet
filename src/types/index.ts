export type WebsiteMode = 'mobile' | 'desktop';

export type LiteAppTheme = 'follow' | 'light' | 'dark';

export type ExternalLinkMode = 'inside' | 'browser';

export type AutoRefreshInterval = 30 | 60 | 300 | 900 | 1800;

export type LiteAppSettings = {
  websiteMode: WebsiteMode;
  theme: LiteAppTheme;
  externalLinks: ExternalLinkMode;
  /** Hide browser chrome so the WebView uses maximum screen space */
  fullScreenMode: boolean;
  /** Allow Cookies */
  cookiesEnabled: boolean;
  /** Clear cookies/cache when leaving the Lite App */
  clearDataOnClose: boolean;
  /** Block third-party cookies in the WebView */
  blockThirdPartyCookies: boolean;
  /** Master data-saver switch */
  dataSaverEnabled: boolean;
  blockImages: boolean;
  disableVideoAutoplay: boolean;
  reduceHeavyContent: boolean;
  autoRefreshEnabled: boolean;
  autoRefreshInterval: AutoRefreshInterval;
};

export type LiteApp = {
  id: string;
  name: string;
  url: string;
  favicon?: string;
  createdAt: number;
  categoryId?: string;
  sortOrder?: number;
  pinned?: boolean;
  lastOpenedAt?: number;
  settings?: LiteAppSettings;
};

export type Bookmark = {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  createdAt: number;
  liteAppId?: string;
};

export type ThemeMode = 'light' | 'dark' | 'system';

export type AppSettings = {
  themeMode: ThemeMode;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  icon?: string;
  isSystem: boolean;
};

export type CatalogApp = {
  id: string;
  name: string;
  url: string;
  category: string;
  categoryId: string;
  favicon: string;
  sortOrder: number;
  isFeatured: boolean;
};

export type CatalogSection = {
  category: string;
  apps: CatalogApp[];
};

export type BrowseHistoryEntry = {
  id: string;
  title?: string;
  url: string;
  favicon?: string;
  liteAppId?: string;
  visitedAt: number;
};
