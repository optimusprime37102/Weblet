import type { SQLiteDatabase } from 'expo-sqlite';
import { getFaviconUrl } from '@/services/favicon';
import type { CatalogApp, CatalogSection } from '@/types';
import { CATEGORY_BY_NAME, ensureCategories } from './categories';
import { toUrlKey } from './helpers';

type CatalogSeed = {
  name: string;
  url: string;
  category: string;
  featured?: boolean;
};

/**
 * Ready-made Lite Apps. Categories must match CATEGORY_SEED names.
 * Expanded beyond the old in-memory list with Shopping / Work / Education / etc.
 */
const CATALOG_SEED: CatalogSeed[] = [
  // Popular
  { name: 'Google', url: 'https://www.google.com', category: 'Popular', featured: true },
  { name: 'YouTube', url: 'https://www.youtube.com', category: 'Popular', featured: true },
  { name: 'Gmail', url: 'https://mail.google.com', category: 'Popular', featured: true },
  { name: 'Reddit', url: 'https://www.reddit.com', category: 'Popular' },
  { name: 'Amazon', url: 'https://www.amazon.com', category: 'Popular' },
  { name: 'Wikipedia', url: 'https://www.wikipedia.org', category: 'Popular' },
  { name: 'X', url: 'https://x.com', category: 'Popular' },
  { name: 'Netflix', url: 'https://www.netflix.com', category: 'Popular' },
  { name: 'Spotify', url: 'https://open.spotify.com', category: 'Popular' },
  { name: 'Discord', url: 'https://discord.com/app', category: 'Popular' },
  { name: 'LinkedIn', url: 'https://www.linkedin.com', category: 'Popular' },
  { name: 'TikTok', url: 'https://www.tiktok.com', category: 'Popular' },
  { name: 'Twitch', url: 'https://www.twitch.tv', category: 'Popular' },
  { name: 'IMDb', url: 'https://www.imdb.com', category: 'Popular' },
  { name: 'Poki', url: 'https://poki.com', category: 'Popular' },
  { name: 'BlueSky', url: 'https://bsky.app', category: 'Popular' },
  { name: 'Mastodon', url: 'https://mastodon.social', category: 'Popular' },

  // Social
  { name: 'Instagram', url: 'https://www.instagram.com', category: 'Social', featured: true },
  { name: 'Facebook', url: 'https://www.facebook.com', category: 'Social' },
  { name: 'WhatsApp Web', url: 'https://web.whatsapp.com', category: 'Social' },
  { name: 'Telegram', url: 'https://web.telegram.org', category: 'Social' },
  { name: 'Pinterest', url: 'https://www.pinterest.com', category: 'Social' },
  { name: 'Tumblr', url: 'https://www.tumblr.com', category: 'Social' },
  { name: 'Reddit', url: 'https://www.reddit.com', category: 'Social' },
  { name: 'X', url: 'https://x.com', category: 'Social' },
  { name: 'LinkedIn', url: 'https://www.linkedin.com', category: 'Social' },

  // Shopping
  { name: 'Amazon', url: 'https://www.amazon.com', category: 'Shopping', featured: true },
  { name: 'eBay', url: 'https://www.ebay.com', category: 'Shopping' },
  { name: 'Walmart', url: 'https://www.walmart.com', category: 'Shopping' },
  { name: 'Etsy', url: 'https://www.etsy.com', category: 'Shopping' },
  { name: 'AliExpress', url: 'https://www.aliexpress.com', category: 'Shopping' },
  { name: 'Target', url: 'https://www.target.com', category: 'Shopping' },
  { name: 'Best Buy', url: 'https://www.bestbuy.com', category: 'Shopping' },

  // Work
  { name: 'Gmail', url: 'https://mail.google.com', category: 'Work', featured: true },
  { name: 'Google Drive', url: 'https://drive.google.com', category: 'Work' },
  { name: 'Google Docs', url: 'https://docs.google.com', category: 'Work' },
  { name: 'Notion', url: 'https://www.notion.so', category: 'Work' },
  { name: 'Slack', url: 'https://app.slack.com', category: 'Work' },
  { name: 'Trello', url: 'https://trello.com', category: 'Work' },
  { name: 'Asana', url: 'https://app.asana.com', category: 'Work' },
  { name: 'Microsoft 365', url: 'https://www.office.com', category: 'Work' },
  { name: 'Zoom', url: 'https://zoom.us', category: 'Work' },

  // Education
  { name: 'Wikipedia', url: 'https://www.wikipedia.org', category: 'Education', featured: true },
  { name: 'Khan Academy', url: 'https://www.khanacademy.org', category: 'Education' },
  { name: 'Coursera', url: 'https://www.coursera.org', category: 'Education' },
  { name: 'Duolingo', url: 'https://www.duolingo.com', category: 'Education' },
  { name: 'Quizlet', url: 'https://quizlet.com', category: 'Education' },
  { name: 'TED', url: 'https://www.ted.com', category: 'Education' },
  { name: 'Stack Overflow', url: 'https://stackoverflow.com', category: 'Education' },

  // News
  { name: 'BBC', url: 'https://www.bbc.com', category: 'News', featured: true },
  { name: 'CNN', url: 'https://www.cnn.com', category: 'News' },
  { name: 'Reuters', url: 'https://www.reuters.com', category: 'News' },
  { name: 'The Guardian', url: 'https://www.theguardian.com', category: 'News' },
  { name: 'New York Times', url: 'https://www.nytimes.com', category: 'News' },
  { name: 'Washington Post', url: 'https://www.washingtonpost.com', category: 'News' },
  { name: 'Axios', url: 'https://www.axios.com', category: 'News' },
  { name: 'NPR', url: 'https://www.npr.org', category: 'News' },
  { name: 'AP News', url: 'https://apnews.com', category: 'News' },
  { name: 'Al Jazeera', url: 'https://www.aljazeera.com', category: 'News' },
  { name: 'Bloomberg', url: 'https://www.bloomberg.com', category: 'News' },
  { name: 'The Verge', url: 'https://www.theverge.com', category: 'News' },
  { name: 'AccuWeather', url: 'https://www.accuweather.com', category: 'News' },

  // Technology
  { name: 'GitHub', url: 'https://github.com', category: 'Technology', featured: true },
  { name: 'Hacker News', url: 'https://news.ycombinator.com', category: 'Technology' },
  { name: 'Product Hunt', url: 'https://www.producthunt.com', category: 'Technology' },
  { name: 'Stack Overflow', url: 'https://stackoverflow.com', category: 'Technology' },
  { name: 'Ars Technica', url: 'https://arstechnica.com', category: 'Technology' },
  { name: 'CNET', url: 'https://www.cnet.com', category: 'Technology' },
  { name: 'Engadget', url: 'https://www.engadget.com', category: 'Technology' },
  { name: 'The Verge', url: 'https://www.theverge.com', category: 'Technology' },
  { name: 'Android Police', url: 'https://www.androidpolice.com', category: 'Technology' },
  { name: 'Android Central', url: 'https://www.androidcentral.com', category: 'Technology' },
  { name: 'APK Mirror', url: 'https://www.apkmirror.com', category: 'Technology' },
  { name: 'AlternativeTo', url: 'https://alternativeto.net', category: 'Technology' },
  { name: 'AnandTech', url: 'https://www.anandtech.com', category: 'Technology' },
  { name: 'Gizmodo', url: 'https://gizmodo.com', category: 'Technology' },

  // Entertainment
  { name: 'YouTube', url: 'https://www.youtube.com', category: 'Entertainment', featured: true },
  { name: 'Netflix', url: 'https://www.netflix.com', category: 'Entertainment' },
  { name: 'Twitch', url: 'https://www.twitch.tv', category: 'Entertainment' },
  { name: 'Spotify', url: 'https://open.spotify.com', category: 'Entertainment' },
  { name: 'IMDb', url: 'https://www.imdb.com', category: 'Entertainment' },
  { name: 'Poki', url: 'https://poki.com', category: 'Entertainment' },
  { name: 'TikTok', url: 'https://www.tiktok.com', category: 'Entertainment' },

  // Finance
  { name: 'Yahoo Finance', url: 'https://finance.yahoo.com', category: 'Finance', featured: true },
  { name: 'Bloomberg', url: 'https://www.bloomberg.com', category: 'Finance' },
  { name: 'TradingView', url: 'https://www.tradingview.com', category: 'Finance' },
  { name: 'PayPal', url: 'https://www.paypal.com', category: 'Finance' },
  { name: 'CoinMarketCap', url: 'https://coinmarketcap.com', category: 'Finance' },

  // Travel
  { name: 'Google Maps', url: 'https://maps.google.com', category: 'Travel', featured: true },
  { name: 'Booking.com', url: 'https://www.booking.com', category: 'Travel' },
  { name: 'Airbnb', url: 'https://www.airbnb.com', category: 'Travel' },
  { name: 'TripAdvisor', url: 'https://www.tripadvisor.com', category: 'Travel' },
  { name: 'Skyscanner', url: 'https://www.skyscanner.com', category: 'Travel' },

  // Sports
  { name: 'ESPN', url: 'https://www.espn.com', category: 'Sports', featured: true },
  { name: 'BBC Sport', url: 'https://www.bbc.com/sport', category: 'Sports' },
  { name: 'NBA', url: 'https://www.nba.com', category: 'Sports' },
  { name: 'Goals', url: 'https://www.goal.com', category: 'Sports' },

  // Health
  { name: 'WebMD', url: 'https://www.webmd.com', category: 'Health', featured: true },
  { name: 'Mayo Clinic', url: 'https://www.mayoclinic.org', category: 'Health' },
  { name: 'Healthline', url: 'https://www.healthline.com', category: 'Health' },
  { name: 'MyFitnessPal', url: 'https://www.myfitnesspal.com', category: 'Health' },

  // Games
  { name: 'Poki', url: 'https://poki.com', category: 'Games', featured: true },
  { name: 'Twitch', url: 'https://www.twitch.tv', category: 'Games' },
  { name: 'Steam', url: 'https://store.steampowered.com', category: 'Games' },
  { name: 'IGN', url: 'https://www.ign.com', category: 'Games' },

  // Utilities
  { name: 'Google Translate', url: 'https://translate.google.com', category: 'Utilities', featured: true },
  { name: 'Google Drive', url: 'https://drive.google.com', category: 'Utilities' },
  { name: 'Speedtest', url: 'https://www.speedtest.net', category: 'Utilities' },
  { name: 'Remove.bg', url: 'https://www.remove.bg', category: 'Utilities' },
  { name: 'TinyPNG', url: 'https://tinypng.com', category: 'Utilities' },
];

const META_CATALOG_SEEDED = 'catalog_seeded_v1';

export async function seedCatalogIfNeeded(db: SQLiteDatabase): Promise<void> {
  await ensureCategories(db);

  const flag = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM meta WHERE key = ?',
    META_CATALOG_SEEDED
  );
  if (flag?.value === '1') return;

  const existing = await db.getFirstAsync<{ c: number }>(
    'SELECT COUNT(*) as c FROM catalog_apps'
  );
  if ((existing?.c ?? 0) === 0) {
    await db.withTransactionAsync(async () => {
      for (let i = 0; i < CATALOG_SEED.length; i++) {
        const item = CATALOG_SEED[i];
        const category = CATEGORY_BY_NAME[item.category];
        if (!category) continue;

        const id = `catalog_${category.slug}_${i}`;
        const urlKey = toUrlKey(item.url);
        await db.runAsync(
          `INSERT OR IGNORE INTO catalog_apps
            (id, name, url, url_key, favicon, category_id, sort_order, is_featured)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          id,
          item.name,
          item.url,
          urlKey,
          getFaviconUrl(item.url),
          category.id,
          i,
          item.featured ? 1 : 0
        );
      }
    });
  }

  await db.runAsync(
    'INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)',
    META_CATALOG_SEEDED,
    '1'
  );
}

type CatalogRow = {
  id: string;
  name: string;
  url: string;
  favicon: string | null;
  category_id: string;
  category_name: string;
  sort_order: number;
  is_featured: number;
};

function mapCatalogRow(row: CatalogRow): CatalogApp {
  return {
    id: row.id,
    name: row.name,
    url: row.url,
    favicon: row.favicon || getFaviconUrl(row.url),
    category: row.category_name,
    categoryId: row.category_id,
    sortOrder: row.sort_order,
    isFeatured: row.is_featured === 1,
  };
}

export async function getCatalogSections(
  db: SQLiteDatabase,
  query = ''
): Promise<CatalogSection[]> {
  const q = query.trim().toLowerCase();
  const rows = q
    ? await db.getAllAsync<CatalogRow>(
        `SELECT ca.id, ca.name, ca.url, ca.favicon, ca.category_id, ca.sort_order, ca.is_featured,
                c.name as category_name
         FROM catalog_apps ca
         JOIN categories c ON c.id = ca.category_id
         WHERE lower(ca.name) LIKE ? OR lower(ca.url) LIKE ? OR lower(c.name) LIKE ?
         ORDER BY c.sort_order ASC, ca.sort_order ASC`,
        `%${q}%`,
        `%${q}%`,
        `%${q}%`
      )
    : await db.getAllAsync<CatalogRow>(
        `SELECT ca.id, ca.name, ca.url, ca.favicon, ca.category_id, ca.sort_order, ca.is_featured,
                c.name as category_name
         FROM catalog_apps ca
         JOIN categories c ON c.id = ca.category_id
         ORDER BY c.sort_order ASC, ca.sort_order ASC`
      );

  const byCategory = new Map<string, CatalogApp[]>();
  for (const row of rows) {
    const app = mapCatalogRow(row);
    const list = byCategory.get(app.category) ?? [];
    list.push(app);
    byCategory.set(app.category, list);
  }

  return Array.from(byCategory.entries()).map(([category, apps]) => ({
    category,
    apps,
  }));
}
