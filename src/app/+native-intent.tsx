/**
 * Runs before Expo Router mounts any screen.
 * Rewrites home-shortcut intents so /browser is the initial route (no Lite Apps flash).
 *
 * `cold=1` → app launched from shortcut (not already running) → X exits the app.
 * Warm opens (app already running) are handled in deepLink.ts with `cold=0`.
 */
export function redirectSystemPath({
  path,
  initial,
}: {
  path: string;
  initial: boolean;
}): string {
  try {
    const normalized = normalizeBrowserDeepLink(path, initial);
    if (normalized) return normalized;
    return path;
  } catch {
    return initial ? '/' : path;
  }
}

function normalizeBrowserDeepLink(
  raw: string,
  initial: boolean
): string | null {
  if (!raw || !raw.includes('browser')) return null;

  if (raw.startsWith('/browser')) {
    return withShortcutFlags(raw, initial);
  }

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    try {
      url = new URL(raw, 'weblet://');
    } catch {
      return null;
    }
  }

  const hostIsBrowser = url.hostname === 'browser';
  const pathIsBrowser =
    url.pathname === '/browser' ||
    url.pathname === 'browser' ||
    url.pathname.endsWith('/browser');

  if (!hostIsBrowser && !pathIsBrowser) return null;

  const params = new URLSearchParams(url.searchParams);
  params.set('fromHome', '1');
  params.set('cold', initial ? '1' : '0');
  const qs = params.toString();
  return qs ? `/browser?${qs}` : '/browser';
}

function withShortcutFlags(path: string, initial: boolean): string {
  const qIndex = path.indexOf('?');
  const base = qIndex >= 0 ? path.slice(0, qIndex) : path;
  const params = new URLSearchParams(qIndex >= 0 ? path.slice(qIndex + 1) : '');
  params.set('fromHome', '1');
  params.set('cold', initial ? '1' : '0');
  return `${base}?${params.toString()}`;
}
