import { getFaviconUrl } from '@/services/favicon';

export type CatalogApp = {
  id: string;
  name: string;
  url: string;
  category: string;
  favicon: string;
};

type CatalogSeed = {
  name: string;
  url: string;
  category: string;
};

const CATALOG_SEED: CatalogSeed[] = [
  // Popular
  { name: 'Google', url: 'https://www.google.com', category: 'Popular' },
  { name: 'Reddit', url: 'https://www.reddit.com', category: 'Popular' },
  { name: 'Amazon', url: 'https://www.amazon.com', category: 'Popular' },
  { name: 'IMDb', url: 'https://www.imdb.com', category: 'Popular' },
  { name: 'Reuters', url: 'https://www.reuters.com', category: 'Popular' },
  { name: 'Washington Post', url: 'https://www.washingtonpost.com', category: 'Popular' },
  { name: 'BlueSky', url: 'https://bsky.app', category: 'Popular' },
  { name: 'Mastodon', url: 'https://mastodon.social', category: 'Popular' },
  { name: 'Poki', url: 'https://poki.com', category: 'Popular' },
  { name: 'TikTok', url: 'https://www.tiktok.com', category: 'Popular' },
  { name: 'Twitch', url: 'https://www.twitch.tv', category: 'Popular' },
  { name: 'YouTube', url: 'https://www.youtube.com', category: 'Popular' },
  { name: 'Gmail', url: 'https://mail.google.com', category: 'Popular' },
  { name: 'Spotify', url: 'https://open.spotify.com', category: 'Popular' },
  { name: 'Netflix', url: 'https://www.netflix.com', category: 'Popular' },
  { name: 'Discord', url: 'https://discord.com/app', category: 'Popular' },
  { name: 'LinkedIn', url: 'https://www.linkedin.com', category: 'Popular' },
  { name: 'Wikipedia', url: 'https://www.wikipedia.org', category: 'Popular' },
  { name: 'X', url: 'https://x.com', category: 'Popular' },

  // News
  { name: 'CNN', url: 'https://www.cnn.com', category: 'News' },
  { name: 'Axios', url: 'https://www.axios.com', category: 'News' },
  { name: 'BBC', url: 'https://www.bbc.com', category: 'News' },
  { name: 'New York Times', url: 'https://www.nytimes.com', category: 'News' },
  { name: 'Reuters', url: 'https://www.reuters.com', category: 'News' },
  { name: 'The Guardian', url: 'https://www.theguardian.com', category: 'News' },
  { name: 'Washington Post', url: 'https://www.washingtonpost.com', category: 'News' },
  { name: 'AccuWeather', url: 'https://www.accuweather.com', category: 'News' },
  { name: 'Al Jazeera', url: 'https://www.aljazeera.com', category: 'News' },
  { name: 'Bloomberg', url: 'https://www.bloomberg.com', category: 'News' },
  { name: 'BlueSky', url: 'https://bsky.app', category: 'News' },
  { name: 'Yahoo Finance', url: 'https://finance.yahoo.com', category: 'News' },
  { name: 'NPR', url: 'https://www.npr.org', category: 'News' },
  { name: 'AP News', url: 'https://apnews.com', category: 'News' },
  { name: 'The Verge', url: 'https://www.theverge.com', category: 'News' },

  // Technology
  { name: 'AnandTech', url: 'https://www.anandtech.com', category: 'Technology' },
  { name: 'Android Central', url: 'https://www.androidcentral.com', category: 'Technology' },
  { name: 'Android Police', url: 'https://www.androidpolice.com', category: 'Technology' },
  { name: 'APK Mirror', url: 'https://www.apkmirror.com', category: 'Technology' },
  { name: 'CNET', url: 'https://www.cnet.com', category: 'Technology' },
  { name: 'Engadget', url: 'https://www.engadget.com', category: 'Technology' },
  { name: 'Gizmodo', url: 'https://gizmodo.com', category: 'Technology' },
  { name: 'Gadget Hacks', url: 'https://www.gadgethacks.com', category: 'Technology' },
  { name: 'BlueSky', url: 'https://bsky.app', category: 'Technology' },
  { name: 'Droid Life', url: 'https://www.droid-life.com', category: 'Technology' },
  { name: 'AlternativeTo', url: 'https://alternativeto.net', category: 'Technology' },
  { name: 'Product Hunt', url: 'https://www.producthunt.com', category: 'Technology' },
  { name: 'Hacker News', url: 'https://news.ycombinator.com', category: 'Technology' },
  { name: 'GitHub', url: 'https://github.com', category: 'Technology' },
  { name: 'Stack Overflow', url: 'https://stackoverflow.com', category: 'Technology' },
  { name: 'Ars Technica', url: 'https://arstechnica.com', category: 'Technology' },

  // Social
  { name: 'Instagram', url: 'https://www.instagram.com', category: 'Social' },
  { name: 'Facebook', url: 'https://www.facebook.com', category: 'Social' },
  { name: 'WhatsApp Web', url: 'https://web.whatsapp.com', category: 'Social' },
  { name: 'Telegram', url: 'https://web.telegram.org', category: 'Social' },
  { name: 'Pinterest', url: 'https://www.pinterest.com', category: 'Social' },
  { name: 'Tumblr', url: 'https://www.tumblr.com', category: 'Social' },

  // Entertainment
  { name: 'YouTube', url: 'https://www.youtube.com', category: 'Entertainment' },
  { name: 'Netflix', url: 'https://www.netflix.com', category: 'Entertainment' },
  { name: 'Twitch', url: 'https://www.twitch.tv', category: 'Entertainment' },
  { name: 'Spotify', url: 'https://open.spotify.com', category: 'Entertainment' },
  { name: 'IMDb', url: 'https://www.imdb.com', category: 'Entertainment' },
  { name: 'Poki', url: 'https://poki.com', category: 'Entertainment' },
];

const CATEGORY_ORDER = [
  'Popular',
  'News',
  'Technology',
  'Social',
  'Entertainment',
] as const;

function toCatalogApp(item: CatalogSeed, index: number): CatalogApp {
  return {
    id: `catalog-${item.category.toLowerCase()}-${index}`,
    name: item.name,
    url: item.url,
    category: item.category,
    favicon: getFaviconUrl(item.url),
  };
}

export const CATALOG_APPS: CatalogApp[] = CATALOG_SEED.map(toCatalogApp);

export type CatalogSection = {
  category: string;
  apps: CatalogApp[];
};

export function getCatalogSections(query = ''): CatalogSection[] {
  const q = query.trim().toLowerCase();
  const filtered = q
    ? CATALOG_APPS.filter(
        (app) =>
          app.name.toLowerCase().includes(q) ||
          app.url.toLowerCase().includes(q) ||
          app.category.toLowerCase().includes(q)
      )
    : CATALOG_APPS;

  return CATEGORY_ORDER.map((category) => ({
    category,
    apps: filtered.filter((app) => app.category === category),
  })).filter((section) => section.apps.length > 0);
}
