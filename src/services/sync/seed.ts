import { getDB } from '../db/database';
import * as drawsRepo from '../db/draws.repo';
import * as drawTypesRepo from '../db/drawTypes.repo';
import * as gamesRepo from '../db/games.repo';
import { fetchDrawTypes, fetchGames } from '../firestore';
import { queryLatestDraws } from './firestoreQueries';

export const SEED_PER_DRAW_TYPE = 10;

/**
 * First-install seed. Idempotent — safe to call repeatedly. Only fetches what's missing:
 * - games / drawTypes are refetched only if local table is empty
 * - draws are seeded per-drawType only if pagination_state row is absent
 *
 * Throws on network failure. Caller is responsible for showing the retry UI.
 */
export async function seed(): Promise<void> {
  const db = getDB();

  const localGames = await gamesRepo.getAllGames(db);
  if (localGames.length === 0) {
    const games = await fetchGames();
    await gamesRepo.upsertGames(db, games);
  }

  let drawTypes = await drawTypesRepo.getAllDrawTypes(db);
  if (drawTypes.length === 0) {
    drawTypes = await fetchDrawTypes();
    await drawTypesRepo.upsertDrawTypes(db, drawTypes);
  }

  for (const dt of drawTypes) {
    const existing = await drawsRepo.getPaginationState(db, dt._id);
    if (existing) continue;

    const draws = await queryLatestDraws(dt._id, SEED_PER_DRAW_TYPE);
    if (draws.length === 0) {
      await drawsRepo.setPaginationState(db, dt._id, 0, false);
      continue;
    }
    await drawsRepo.upsertDraws(db, draws);
    const oldestContiguousDate = draws[draws.length - 1].date;
    const hasMore = draws.length === SEED_PER_DRAW_TYPE;
    await drawsRepo.setPaginationState(db, dt._id, oldestContiguousDate, hasMore);
  }
}
