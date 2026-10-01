export type WebsiteMode = 'mobile' | 'desktop';

export type LiteAppTheme = 'follow' | 'light' | 'dark';

export type ExternalLinkMode = 'inside' | 'browser';

export type AutoRefreshInterval = 30 | 60 | 300 | 900 | 1800;

export type LiteAppSettings = {
  websiteMode: WebsiteMode;
  theme: LiteAppTheme;
  externalLinks: ExternalLinkMode;
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
  settings?: LiteAppSettings;
};

export type Bookmark = {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  createdAt: number;
};

export type ThemeMode = 'light' | 'dark' | 'system';

export type AppSettings = {
  themeMode: ThemeMode;
};
