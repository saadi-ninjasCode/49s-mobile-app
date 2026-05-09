import { getDB } from '../db/database';
import * as drawsRepo from '../db/draws.repo';
import {
  queryDrawsAfter,
  queryDrawsBefore,
  queryDrawsForDay,
  queryLatestDraws,
} from './firestoreQueries';

export const PAGE_SIZE = 10;

/**
 * Delta-fetch draws newer than the most recent local row for this drawType.
 * Used by both warm-launch background sync and pull-to-refresh on the Draw screen.
 *
 * If there are no new draws on Firestore, this query returns 0 documents (Firestore
 * still bills a 1-read minimum on empty queries — that's the floor for PTR).
 *
 * Does NOT touch oldestContiguousDate: the head extends, the tail is unchanged.
 */
/**
 * Pulls every draw newer than the most recent local row for this drawType,
 * filling any gap larger than `max` by iterating ASC until the server reports
 * no more rows. Used by both warm-launch background sync and pull-to-refresh
 * on the Draw screen.
 *
 * Termination is data-driven, not iteration-capped:
 *  - an empty batch means we've crossed the latest server row,
 *  - a partial batch (length < max) means this was the final page.
 *
 * No-new-draws path is one query that returns 0 docs (Firestore charges a
 * 1-read minimum on empty queries).
 *
 * Per-batch upsert is intentional: if the loop is interrupted (crash, app
 * backgrounded), the next call resumes from the partial-progress newestLocal.
 */
export async function fetchLatestSinceLocal(
  drawTypeId: string,
  max: number = PAGE_SIZE,
): Promise<number> {
  const db = getDB();
  const initialNewestLocal = await drawsRepo.getNewestLocalDate(db, drawTypeId);

  // Cold path: no local data yet. Fetch the newest `max` only — pagination
  // (loadNextPage) will fill older history as the user scrolls.
  if (initialNewestLocal == null) {
    const draws = await queryLatestDraws(drawTypeId, max);
    if (draws.length === 0) return 0;
    await drawsRepo.upsertDraws(db, draws);
    return draws.length;
  }

  // Catch-up path: iterate ASC from the cursor forward until the server says
  // there is nothing more.
  let totalNew = 0;
  let cursor = initialNewestLocal;
  while (true) {
    const batch = await queryDrawsAfter(drawTypeId, cursor, max);
    if (batch.length === 0) break;
    await drawsRepo.upsertDraws(db, batch);
    totalNew += batch.length;
    cursor = batch.at(-1)!.date; // ASC: last element is the batch's newest; guarded by length check above
    if (batch.length < max) break;
  }
  return totalNew;
}

/**
 * Loads the next contiguous page (older than current head) and advances
 * oldestContiguousDate to the date of the last fetched row.
 */
export async function loadNextPage(
  drawTypeId: string,
  pageSize: number = PAGE_SIZE,
): Promise<{ count: number; hasMore: boolean }> {
  const db = getDB();
  const state = await drawsRepo.getPaginationState(db, drawTypeId);
  if (!state) return { count: 0, hasMore: false };
  if (!state.hasMore) return { count: 0, hasMore: false };

  const draws = await queryDrawsBefore(drawTypeId, state.oldestContiguousDate, pageSize);
  if (draws.length === 0) {
    await drawsRepo.setPaginationState(db, drawTypeId, state.oldestContiguousDate, false);
    return { count: 0, hasMore: false };
  }
  await drawsRepo.upsertDraws(db, draws);

  const newOldest = draws.at(-1)!.date;
  const hasMore = draws.length === pageSize;
  await drawsRepo.setPaginationState(db, drawTypeId, newOldest, hasMore);
  return { count: draws.length, hasMore };
}

/**
 * DB-first lookup for a date filter. Falls back to Firestore on cache miss.
 * The fetched row is upserted but does NOT advance oldestContiguousDate
 * (it may sit older than the contiguous head — pagination will cross it
 * later, idempotently).
 */
export async function fetchDateFilter(
  drawTypeId: string,
  dayMs: number,
): Promise<Draw | null> {
  const db = getDB();
  const start = new Date(dayMs);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  const startMs = start.getTime();
  const endMs = end.getTime();

  const local = await drawsRepo.getDrawsForDay(db, drawTypeId, startMs, endMs);
  if (local[0]) return local[0];

  const fetched = await queryDrawsForDay(drawTypeId, startMs, endMs);
  if (fetched.length === 0) return null;
  await drawsRepo.upsertDraws(db, fetched);
  return fetched[0];
}
