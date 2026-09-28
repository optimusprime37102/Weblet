export type LiteApp = {
  id: string;
  name: string;
  url: string;
  favicon?: string;
  createdAt: number;
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
