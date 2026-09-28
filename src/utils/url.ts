const SEARCH_BASE = 'https://www.google.com/search?q=';

export function looksLikeUrl(input: string): boolean {
  const value = input.trim();
  if (!value) return false;
  if (/^https?:\/\//i.test(value)) return true;
  if (/^localhost(:\d+)?(\/|$)/i.test(value)) return true;
  if (/^[\w-]+(\.[\w-]+)+(\/.*)?$/i.test(value)) return true;
  return false;
}

export function normalizeUrl(input: string): string {
  const value = input.trim();
  if (!value) return '';

  if (looksLikeUrl(value)) {
    if (/^https?:\/\//i.test(value)) return value;
    return `https://${value}`;
  }

  return `${SEARCH_BASE}${encodeURIComponent(value)}`;
}

export function getHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export function getDisplayNameFromUrl(url: string): string {
  const host = getHostname(url);
  const base = host.split('.')[0] || host;
  return base.charAt(0).toUpperCase() + base.slice(1);
}

export function isValidHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}
