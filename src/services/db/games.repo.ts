import type { SQLiteDatabase } from 'expo-sqlite';

interface GameRow {
  id: string;
  slug: string | null;
  name: string;
  iconName: string | null;
  mainBallCount: number;
  mainBallMax: number;
  specialBallCount: number;
  specialBallMax: number;
  hotBallJson: string | null;
  coldBallJson: string | null;
  hotColdCount: number | null;
  cachedAt: number;
  serverUpdatedAt: number | null;
}

const rowToGame = (r: GameRow): Game => ({
  _id: r.id,
  slug: r.slug ?? undefined,
  name: r.name,
  icon_name: r.iconName ?? '',
  mainBallCount: r.mainBallCount,
  mainBallMax: r.mainBallMax,
  specialBallCount: r.specialBallCount,
  specialBallMax: r.specialBallMax,
  hotBall: r.hotBallJson ? JSON.parse(r.hotBallJson) : [],
  coldBall: r.coldBallJson ? JSON.parse(r.coldBallJson) : [],
  hotColdCount: r.hotColdCount ?? undefined,
  serverUpdatedAt: r.serverUpdatedAt ?? undefined,
});

export const getAllGames = async (db: SQLiteDatabase): Promise<Game[]> => {
  const rows = await db.getAllAsync<GameRow>('SELECT * FROM games');
  return rows.map(rowToGame);
};

export const getGameById = async (
  db: SQLiteDatabase,
  id: string,
): Promise<Game | null> => {
  const row = await db.getFirstAsync<GameRow>('SELECT * FROM games WHERE id = ?', id);
  return row ? rowToGame(row) : null;
};

export const upsertGames = async (
  db: SQLiteDatabase,
  games: Game[],
): Promise<void> => {
  if (games.length === 0) return;
  const now = Date.now();
  await db.withTransactionAsync(async () => {
    for (const g of games) {
      await db.runAsync(
        `INSERT OR REPLACE INTO games
         (id, slug, name, iconName, mainBallCount, mainBallMax, specialBallCount, specialBallMax, hotBallJson, coldBallJson, hotColdCount, cachedAt, serverUpdatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        g._id,
        g.slug ?? null,
        g.name,
        g.icon_name ?? null,
        g.mainBallCount,
        g.mainBallMax,
        g.specialBallCount,
        g.specialBallMax,
        g.hotBall ? JSON.stringify(g.hotBall) : null,
        g.coldBall ? JSON.stringify(g.coldBall) : null,
        g.hotColdCount ?? null,
        now,
        g.serverUpdatedAt ?? null,
      );
    }
  });
};

export const getMaxServerUpdatedAt = async (
  db: SQLiteDatabase,
): Promise<number | null> => {
  const row = await db.getFirstAsync<{ maxAt: number | null }>(
    'SELECT MAX(serverUpdatedAt) as maxAt FROM games',
  );
  return row?.maxAt ?? null;
};
