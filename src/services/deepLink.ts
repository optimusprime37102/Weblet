import * as Linking from 'expo-linking';
import { router } from 'expo-router';

function paramValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

let lastHandledUrl = '';

/**
 * Warm-start only: Weblet was already open when the user taps a home shortcut.
 * Sets cold=0 so X returns to Lite Apps home instead of exiting.
 */
export function openBrowserFromDeepLink(url: string): boolean {
  if (!url || url === lastHandledUrl) return false;

  const parsed = Linking.parse(url);
  const path = (parsed.path ?? '').replace(/^\//, '');
  const isBrowser =
    path === 'browser' ||
    path.endsWith('/browser') ||
    parsed.hostname === 'browser';
  if (!isBrowser) return false;

  const query = parsed.queryParams ?? {};
  const targetUrl = paramValue(query.url as string | string[] | undefined);
  if (!targetUrl) return false;

  lastHandledUrl = url;
  router.replace({
    pathname: '/browser',
    params: {
      url: targetUrl,
      title: paramValue(query.title as string | string[] | undefined),
      fromHome: '1',
      cold: '0',
    },
  });
  return true;
}

export function subscribeHomeShortcutLinks() {
  const subscription = Linking.addEventListener('url', ({ url }) => {
    lastHandledUrl = '';
    openBrowserFromDeepLink(url);
  });
  return () => subscription.remove();
}
