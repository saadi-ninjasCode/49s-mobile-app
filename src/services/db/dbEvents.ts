import { addDatabaseChangeListener } from 'expo-sqlite';
import { useEffect } from 'react';

export type WatchedTable = 'games' | 'drawTypes' | 'draws' | 'drawType_pagination';

export function subscribeDbChanges(
  table: WatchedTable,
  callback: () => void,
): () => void {
  const sub = addDatabaseChangeListener((event) => {
    if (event.tableName === table) callback();
  });
  return () => sub.remove();
}

export function useDbChange(table: WatchedTable, callback: () => void): void {
  useEffect(() => subscribeDbChanges(table, callback), [table, callback]);
}
