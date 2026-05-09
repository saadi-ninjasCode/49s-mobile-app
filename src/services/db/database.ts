import * as SQLite from 'expo-sqlite';

export const DB_NAME = 'games49s.db';

let _db: SQLite.SQLiteDatabase | null = null;

export const getDB = (): SQLite.SQLiteDatabase => {
  if (!_db) _db = SQLite.openDatabaseSync(DB_NAME);
  return _db;
};
