import type { SQLiteDatabase } from 'expo-sqlite';

type Migration = (db: SQLiteDatabase) => Promise<void>;

const MIGRATIONS: Migration[] = [
  async (db) => {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS games (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        iconName TEXT,
        slug TEXT,
        mainBallCount INTEGER,
        mainBallMax INTEGER,
        specialBallCount INTEGER,
        specialBallMax INTEGER,
        hotBallJson TEXT,
        coldBallJson TEXT,
        hotColdCount INTEGER,
        cachedAt INTEGER NOT NULL,
        serverUpdatedAt INTEGER
      );

      CREATE TABLE IF NOT EXISTS drawTypes (
        id TEXT PRIMARY KEY,
        gameId TEXT NOT NULL,
        name TEXT NOT NULL,
        iconName TEXT,
        hour INTEGER,
        minute INTEGER,
        timeZone TEXT
      );

      CREATE TABLE IF NOT EXISTS draws (
        id TEXT PRIMARY KEY,
        gameId TEXT NOT NULL,
        drawTypeId TEXT NOT NULL,
        date INTEGER NOT NULL,
        ballsJson TEXT NOT NULL,
        specialBallsJson TEXT NOT NULL,
        cachedAt INTEGER NOT NULL,
        serverUpdatedAt INTEGER,
        deletedAt INTEGER
      );

      CREATE INDEX IF NOT EXISTS idx_draws_drawTypeId_date ON draws(drawTypeId, date DESC);

      CREATE INDEX IF NOT EXISTS idx_draws_drawTypeId_serverUpdatedAt
        ON draws(drawTypeId, serverUpdatedAt);

      CREATE TABLE IF NOT EXISTS drawType_pagination (
        drawTypeId TEXT PRIMARY KEY,
        oldestContiguousDate INTEGER NOT NULL,
        hasMore INTEGER NOT NULL DEFAULT 1
      );
    `);
  },
];

export async function runMigrations(db: SQLiteDatabase): Promise<void> {
  await db.execAsync('PRAGMA journal_mode = WAL;');

  const versionRow = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = versionRow?.user_version ?? 0;

  for (let v = currentVersion; v < MIGRATIONS.length; v++) {
    const migration = MIGRATIONS[v];
    await db.withTransactionAsync(async () => {
      await migration(db);
      await db.execAsync(`PRAGMA user_version = ${v + 1}`);
    });
  }
}

export async function resetDatabase(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    DROP TABLE IF EXISTS drawType_pagination;
    DROP TABLE IF EXISTS draws;
    DROP TABLE IF EXISTS drawTypes;
    DROP TABLE IF EXISTS games;
    PRAGMA user_version = 0;
  `);
  await runMigrations(db);
}
