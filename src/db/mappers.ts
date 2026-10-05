import type {
  AutoRefreshInterval,
  ExternalLinkMode,
  LiteApp,
  LiteAppSettings,
  LiteAppTheme,
  WebsiteMode,
} from '@/types';
import { DEFAULT_LITE_APP_SETTINGS } from '@/services/liteAppSettings';
import { intToBool } from './helpers';

export type LiteAppRow = {
  id: string;
  name: string;
  url: string;
  url_key: string;
  favicon: string | null;
  category_id: string | null;
  sort_order: number;
  pinned: number;
  last_opened_at: number | null;
  created_at: number;
  updated_at: number;
  // joined settings
  website_mode: string;
  theme: string;
  external_links: string;
  full_screen_mode: number | null;
  cookies_enabled: number;
  clear_data_on_close: number;
  block_third_party_cookies: number;
  data_saver_enabled: number;
  block_images: number;
  disable_video_autoplay: number;
  reduce_heavy_content: number;
  auto_refresh_enabled: number;
  auto_refresh_interval: number;
};

export function settingsFromRow(row: LiteAppRow): LiteAppSettings {
  return {
    websiteMode: (row.website_mode as WebsiteMode) || DEFAULT_LITE_APP_SETTINGS.websiteMode,
    theme: (row.theme as LiteAppTheme) || DEFAULT_LITE_APP_SETTINGS.theme,
    externalLinks:
      (row.external_links as ExternalLinkMode) ||
      DEFAULT_LITE_APP_SETTINGS.externalLinks,
    fullScreenMode: intToBool(row.full_screen_mode ?? 0),
    cookiesEnabled: intToBool(row.cookies_enabled),
    clearDataOnClose: intToBool(row.clear_data_on_close),
    blockThirdPartyCookies: intToBool(row.block_third_party_cookies),
    dataSaverEnabled: intToBool(row.data_saver_enabled),
    blockImages: intToBool(row.block_images),
    disableVideoAutoplay: intToBool(row.disable_video_autoplay),
    reduceHeavyContent: intToBool(row.reduce_heavy_content),
    autoRefreshEnabled: intToBool(row.auto_refresh_enabled),
    autoRefreshInterval: (row.auto_refresh_interval ||
      DEFAULT_LITE_APP_SETTINGS.autoRefreshInterval) as AutoRefreshInterval,
  };
}

export function mapLiteAppRow(row: LiteAppRow): LiteApp {
  return {
    id: row.id,
    name: row.name,
    url: row.url,
    favicon: row.favicon ?? undefined,
    createdAt: row.created_at,
    categoryId: row.category_id ?? undefined,
    sortOrder: row.sort_order,
    pinned: intToBool(row.pinned),
    lastOpenedAt: row.last_opened_at ?? undefined,
    settings: settingsFromRow(row),
  };
}
