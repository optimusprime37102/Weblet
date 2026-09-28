import type { LiteApp } from '@/types';
import { createId } from '@/utils/id';
import { getFaviconUrl } from '@/services/favicon';

const SEED: Array<Pick<LiteApp, 'name' | 'url'>> = [
  { name: 'YouTube', url: 'https://www.youtube.com' },
  { name: 'Reddit', url: 'https://www.reddit.com' },
  { name: 'Gmail', url: 'https://mail.google.com' },
  { name: 'Spotify', url: 'https://open.spotify.com' },
  { name: 'Twitter', url: 'https://x.com' },
  { name: 'Wikipedia', url: 'https://www.wikipedia.org' },
  { name: 'Netflix', url: 'https://www.netflix.com' },
  { name: 'Amazon', url: 'https://www.amazon.com' },
  { name: 'Twitch', url: 'https://www.twitch.tv' },
  { name: 'Discord', url: 'https://discord.com/app' },
  { name: 'LinkedIn', url: 'https://www.linkedin.com' },
];

export function createSeedLiteApps(): LiteApp[] {
  const now = Date.now();
  return SEED.map((item, index) => ({
    id: createId('app'),
    name: item.name,
    url: item.url,
    favicon: getFaviconUrl(item.url),
    createdAt: now + index,
  }));
}
