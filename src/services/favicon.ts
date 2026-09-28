import { getHostname } from '@/utils/url';

export function getFaviconUrl(url: string, size = 128): string {
  const host = getHostname(url);
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=${size}`;
}
