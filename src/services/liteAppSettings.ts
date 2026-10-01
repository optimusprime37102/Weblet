import type {
  AutoRefreshInterval,
  LiteApp,
  LiteAppSettings,
} from '@/types';
import { getHostname } from '@/utils/url';

export const DEFAULT_LITE_APP_SETTINGS: LiteAppSettings = {
  websiteMode: 'mobile',
  theme: 'follow',
  externalLinks: 'browser',
  cookiesEnabled: true,
  clearDataOnClose: false,
  blockThirdPartyCookies: false,
  dataSaverEnabled: false,
  blockImages: false,
  disableVideoAutoplay: false,
  reduceHeavyContent: false,
  autoRefreshEnabled: false,
  autoRefreshInterval: 60,
};

export const AUTO_REFRESH_OPTIONS: Array<{
  value: AutoRefreshInterval;
  label: string;
}> = [
  { value: 30, label: '30 sec' },
  { value: 60, label: '1 min' },
  { value: 300, label: '5 min' },
  { value: 900, label: '15 min' },
  { value: 1800, label: '30 min' },
];

const DESKTOP_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const MOBILE_USER_AGENT =
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36';

export function getLiteAppSettings(
  app?: LiteApp | null
): LiteAppSettings {
  if (!app?.settings) return { ...DEFAULT_LITE_APP_SETTINGS };
  return {
    ...DEFAULT_LITE_APP_SETTINGS,
    ...app.settings,
  };
}

export function withDefaultSettings(app: LiteApp): LiteApp {
  return {
    ...app,
    settings: getLiteAppSettings(app),
  };
}

export function getUserAgent(mode: LiteAppSettings['websiteMode']): string {
  return mode === 'desktop' ? DESKTOP_USER_AGENT : MOBILE_USER_AGENT;
}

/** Effective data-saver flags (master OR individual). */
export function getDataSaverFlags(settings: LiteAppSettings) {
  const master = settings.dataSaverEnabled;
  return {
    blockImages: master || settings.blockImages,
    disableVideoAutoplay: master || settings.disableVideoAutoplay,
    reduceHeavyContent: master || settings.reduceHeavyContent,
  };
}

export function getBaseDomain(hostname: string): string {
  const host = hostname.replace(/^www\./i, '').toLowerCase();
  const parts = host.split('.').filter(Boolean);
  if (parts.length <= 2) return host;
  return parts.slice(-2).join('.');
}

export function isSameSiteUrl(appUrl: string, targetUrl: string): boolean {
  try {
    const appBase = getBaseDomain(new URL(appUrl).hostname);
    const targetHost = new URL(targetUrl).hostname
      .replace(/^www\./i, '')
      .toLowerCase();
    if (!appBase || !targetHost) return true;
    return targetHost === appBase || targetHost.endsWith(`.${appBase}`);
  } catch {
    return true;
  }
}

export function buildThemeInjection(theme: LiteAppSettings['theme']): string {
  if (theme === 'follow') return '';
  const scheme = theme === 'dark' ? 'dark' : 'light';
  return `
    (function() {
      try {
        var root = document.documentElement;
        root.style.colorScheme = '${scheme}';
        var existing = document.querySelector('meta[name="color-scheme"]');
        if (existing) {
          existing.setAttribute('content', '${scheme}');
        } else {
          var meta = document.createElement('meta');
          meta.name = 'color-scheme';
          meta.content = '${scheme}';
          if (document.head) document.head.appendChild(meta);
        }
      } catch (e) {}
      true;
    })();
  `;
}

export function buildClearSiteDataScript(): string {
  return `
    (function() {
      try {
        try { localStorage.clear(); } catch (e) {}
        try { sessionStorage.clear(); } catch (e) {}
        try {
          if (window.indexedDB && indexedDB.databases) {
            indexedDB.databases().then(function(dbs) {
              (dbs || []).forEach(function(db) {
                if (db && db.name) indexedDB.deleteDatabase(db.name);
              });
            });
          }
        } catch (e) {}
        try {
          document.cookie.split(';').forEach(function(c) {
            var name = c.replace(/^ +/, '').split('=')[0];
            if (!name) return;
            document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
            document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=' + location.hostname;
          });
        } catch (e) {}
      } catch (e) {}
      true;
    })();
  `;
}

export function buildDataSaverInjection(settings: LiteAppSettings): string {
  const flags = getDataSaverFlags(settings);
  if (
    !flags.blockImages &&
    !flags.disableVideoAutoplay &&
    !flags.reduceHeavyContent
  ) {
    return '';
  }

  return `
    (function() {
      try {
        var style = document.getElementById('weblet-data-saver');
        if (!style) {
          style = document.createElement('style');
          style.id = 'weblet-data-saver';
          (document.head || document.documentElement).appendChild(style);
        }
        var css = '';
        ${
          flags.blockImages
            ? `css += 'img,picture,svg image{visibility:hidden!important;opacity:0!important;max-height:0!important;}';`
            : ''
        }
        ${
          flags.reduceHeavyContent
            ? `css += 'video,iframe,embed,object,canvas{display:none!important;}*{animation:none!important;transition:none!important;}';`
            : ''
        }
        style.textContent = css;

        ${
          flags.blockImages
            ? `
        document.querySelectorAll('img').forEach(function(img) {
          img.removeAttribute('src');
          img.removeAttribute('srcset');
          img.loading = 'lazy';
        });
        `
            : ''
        }

        ${
          flags.disableVideoAutoplay || flags.reduceHeavyContent
            ? `
        document.querySelectorAll('video,audio').forEach(function(el) {
          try {
            el.autoplay = false;
            el.removeAttribute('autoplay');
            el.pause && el.pause();
            el.preload = 'none';
          } catch (e) {}
        });
        `
            : ''
        }
      } catch (e) {}
      true;
    })();
  `;
}

/** Combined injected JS for theme + data saver. */
export function buildWebViewInjection(settings: LiteAppSettings): string {
  const parts = [
    buildThemeInjection(settings.theme),
    buildDataSaverInjection(settings),
  ].filter(Boolean);
  return parts.join('\n');
}

export function findLiteAppForUrl(
  apps: LiteApp[],
  url: string
): LiteApp | undefined {
  const normalized = url.replace(/\/$/, '');
  return apps.find((app) => {
    const appUrl = app.url.replace(/\/$/, '');
    if (normalized === appUrl) return true;
    try {
      return getHostname(app.url) === getHostname(url);
    } catch {
      return false;
    }
  });
}
