import { getDB } from '../db/database';
import * as drawTypesRepo from '../db/drawTypes.repo';
import { seed } from './seed';
import { fetchLatestSinceLocal } from './syncDraws';

export interface BootstrapResult {
  wasFreshInstall: boolean;
}

/**
 * Run on app start, after migrations have completed.
 *
 * Fresh install or partial-seed recovery: throws on network failure so the
 * caller can render `<ErrorView onRetry={bootstrap} />`.
 *
 * Warm launch (DB has all drawType pagination rows): returns immediately.
 * Caller should then trigger `backgroundRefresh()` non-blockingly.
 */
export async function bootstrap(): Promise<BootstrapResult> {
  const db = getDB();

  const dtCountRow = await db.getFirstAsync<{ c: number }>(
    'SELECT COUNT(*) as c FROM drawTypes',
  );
  const pagCountRow = await db.getFirstAsync<{ c: number }>(
    'SELECT COUNT(*) as c FROM drawType_pagination',
  );
  const drawTypeCount = dtCountRow?.c ?? 0;
  const paginationCount = pagCountRow?.c ?? 0;

  // Treat "needs seed" broadly: empty DB or partial seed (counts mismatch)
  if (drawTypeCount === 0 || drawTypeCount !== paginationCount) {
    await seed();
    return { wasFreshInstall: drawTypeCount === 0 };
  }

  return { wasFreshInstall: false };
}

/**
 * Non-blocking catch-up after warm launch. Pulls new draws since the latest
 * local row for each drawType.
 */
export async function backgroundRefresh(): Promise<void> {
  const db = getDB();
  const drawTypes = await drawTypesRepo.getAllDrawTypes(db);
  await Promise.all(
    drawTypes.map((dt) => fetchLatestSinceLocal(dt._id).catch(() => 0)),
  );
}
