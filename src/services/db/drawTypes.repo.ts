import type { SQLiteDatabase } from 'expo-sqlite';

interface DrawTypeRow {
  id: string;
  gameId: string;
  name: string;
  iconName: string | null;
  hour: number | null;
  minute: number | null;
  timeZone: string | null;
}

const rowToDrawType = (r: DrawTypeRow): DrawType => ({
  _id: r.id,
  gameId: r.gameId,
  name: r.name,
  icon_name: r.iconName ?? '',
  hour: r.hour ?? 0,
  minute: r.minute ?? 0,
  timeZone: r.timeZone ?? 'Europe/London',
});

export const getAllDrawTypes = async (db: SQLiteDatabase): Promise<DrawType[]> => {
  const rows = await db.getAllAsync<DrawTypeRow>(
    'SELECT * FROM drawTypes ORDER BY hour ASC, minute ASC',
  );
  return rows.map(rowToDrawType);
};

export const getDrawTypeById = async (
  db: SQLiteDatabase,
  id: string,
): Promise<DrawType | null> => {
  const row = await db.getFirstAsync<DrawTypeRow>(
    'SELECT * FROM drawTypes WHERE id = ?',
    id,
  );
  return row ? rowToDrawType(row) : null;
};

export const upsertDrawTypes = async (
  db: SQLiteDatabase,
  drawTypes: DrawType[],
): Promise<void> => {
  if (drawTypes.length === 0) return;
  await db.withTransactionAsync(async () => {
    for (const dt of drawTypes) {
      await db.runAsync(
        `INSERT OR REPLACE INTO drawTypes
         (id, gameId, name, iconName, hour, minute, timeZone)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        dt._id,
        dt.gameId,
        dt.name,
        dt.icon_name ?? null,
        dt.hour,
        dt.minute,
        dt.timeZone,
      );
    }
  });
};
