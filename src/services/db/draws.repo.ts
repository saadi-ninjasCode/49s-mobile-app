import type { SQLiteDatabase } from 'expo-sqlite';

interface DrawRow {
  id: string;
  gameId: string;
  drawTypeId: string;
  date: number;
  ballsJson: string;
  specialBallsJson: string;
  cachedAt: number;
}

const rowToDraw = (r: DrawRow): Draw => ({
  _id: r.id,
  gameId: r.gameId,
  drawTypeId: r.drawTypeId,
  date: r.date,
  balls: JSON.parse(r.ballsJson),
  specialBalls: JSON.parse(r.specialBallsJson),
});

export interface PaginationState {
  drawTypeId: string;
  oldestContiguousDate: number;
  hasMore: boolean;
}

const rowToPaginationState = (r: {
  drawTypeId: string;
  oldestContiguousDate: number;
  hasMore: number;
}): PaginationState => ({
  drawTypeId: r.drawTypeId,
  oldestContiguousDate: r.oldestContiguousDate,
  hasMore: r.hasMore === 1,
});

export const getNewestLocalDate = async (
  db: SQLiteDatabase,
  drawTypeId: string,
): Promise<number | null> => {
  const row = await db.getFirstAsync<{ maxDate: number | null }>(
    'SELECT MAX(date) as maxDate FROM draws WHERE drawTypeId = ?',
    drawTypeId,
  );
  return row?.maxDate ?? null;
};

export const getLatestDraw = async (
  db: SQLiteDatabase,
  drawTypeId: string,
): Promise<Draw | null> => {
  const row = await db.getFirstAsync<DrawRow>(
    'SELECT * FROM draws WHERE drawTypeId = ? ORDER BY date DESC LIMIT 1',
    drawTypeId,
  );
  return row ? rowToDraw(row) : null;
};

/**
 * Returns the contiguous head from the latest draw down to oldestContiguousDate.
 * Orphan rows older than oldestContiguousDate (e.g. fetched via date filter) are
 * persisted but excluded here so the list never shows gaps in the middle.
 */
export const getContiguousDraws = async (
  db: SQLiteDatabase,
  drawTypeId: string,
  rowLimit: number,
  offset: number,
): Promise<Draw[]> => {
  const state = await getPaginationState(db, drawTypeId);
  const minDate = state?.oldestContiguousDate ?? 0;
  const rows = await db.getAllAsync<DrawRow>(
    `SELECT * FROM draws
     WHERE drawTypeId = ? AND date >= ?
     ORDER BY date DESC
     LIMIT ? OFFSET ?`,
    drawTypeId,
    minDate,
    rowLimit,
    offset,
  );
  return rows.map(rowToDraw);
};

export const getDrawsForDay = async (
  db: SQLiteDatabase,
  drawTypeId: string,
  startMs: number,
  endMs: number,
): Promise<Draw[]> => {
  const rows = await db.getAllAsync<DrawRow>(
    `SELECT * FROM draws
     WHERE drawTypeId = ? AND date >= ? AND date < ?
     ORDER BY date DESC`,
    drawTypeId,
    startMs,
    endMs,
  );
  return rows.map(rowToDraw);
};

export const upsertDraws = async (
  db: SQLiteDatabase,
  draws: Draw[],
): Promise<void> => {
  if (draws.length === 0) return;
  const now = Date.now();
  await db.withTransactionAsync(async () => {
    for (const d of draws) {
      await db.runAsync(
        `INSERT OR REPLACE INTO draws
         (id, gameId, drawTypeId, date, ballsJson, specialBallsJson, cachedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        d._id,
        d.gameId,
        d.drawTypeId,
        d.date,
        JSON.stringify(d.balls),
        JSON.stringify(d.specialBalls),
        now,
      );
    }
  });
};

export const getPaginationState = async (
  db: SQLiteDatabase,
  drawTypeId: string,
): Promise<PaginationState | null> => {
  const row = await db.getFirstAsync<{
    drawTypeId: string;
    oldestContiguousDate: number;
    hasMore: number;
  }>('SELECT * FROM drawType_pagination WHERE drawTypeId = ?', drawTypeId);
  return row ? rowToPaginationState(row) : null;
};

export const setPaginationState = async (
  db: SQLiteDatabase,
  drawTypeId: string,
  oldestContiguousDate: number,
  hasMore: boolean,
): Promise<void> => {
  await db.runAsync(
    `INSERT OR REPLACE INTO drawType_pagination
     (drawTypeId, oldestContiguousDate, hasMore) VALUES (?, ?, ?)`,
    drawTypeId,
    oldestContiguousDate,
    hasMore ? 1 : 0,
  );
};
