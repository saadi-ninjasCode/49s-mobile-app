import { pickedDayAsLondon } from '../../utilities/date';
import { getDB } from '../db/database';
import * as drawsRepo from '../db/draws.repo';
import {
  queryDrawsBefore,
  queryDrawsForDay,
} from './firestoreQueries';

export const PAGE_SIZE = 10;

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
  // The picker showed the user a calendar day in their device tz; treat the
  // displayed Y/M/D as a London civil day and bracket it with London-tz UTC
  // bounds so we hit the right draw regardless of where the device runs.
  const { rangeStartMs, rangeEndMs } = pickedDayAsLondon(new Date(dayMs));

  const local = await drawsRepo.getDrawsForDay(db, drawTypeId, rangeStartMs, rangeEndMs);
  if (local[0]) return local[0];

  const fetched = await queryDrawsForDay(drawTypeId, rangeStartMs, rangeEndMs);
  if (fetched.length === 0) return null;
  await drawsRepo.upsertDraws(db, fetched);
  return fetched[0];
}
