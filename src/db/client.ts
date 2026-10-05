import * as SQLite from 'expo-sqlite';
import type { SQLiteDatabase } from 'expo-sqlite';
import {
  DATABASE_VERSION,
  applySchema,
  getUserVersion,
  migrateSchema,
  setUserVersion,
} from './schema';
import { seedCatalogIfNeeded } from './seedCatalog';
import { migrateFromAsyncStorage } from './migrateAsyncStorage';

const DB_NAME = 'weblet.db';

let dbPromise: Promise<SQLiteDatabase> | null = null;
let initialized = false;

async function configureAndMigrate(db: SQLiteDatabase): Promise<void> {
  await db.execAsync('PRAGMA foreign_keys = ON;');
  await db.execAsync('PRAGMA journal_mode = WAL;');

  const version = await getUserVersion(db);
  if (version < DATABASE_VERSION) {
    // Fresh DB (v0): create full current schema. Existing DBs: alter only.
    if (version === 0) {
      await applySchema(db);
    } else {
      await migrateSchema(db, version);
    }
    await setUserVersion(db, DATABASE_VERSION);
  }

  await migrateFromAsyncStorage(db);
  await seedCatalogIfNeeded(db);
}

export async function getDb(): Promise<SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync(DB_NAME);
      if (!initialized) {
        await configureAndMigrate(db);
        initialized = true;
      }
      return db;
    })().catch((error) => {
      dbPromise = null;
      initialized = false;
      throw error;
    });
  }
  return dbPromise;
}

/** For tests / rare reset paths. */
export function resetDbClient(): void {
  dbPromise = null;
  initialized = false;
}
