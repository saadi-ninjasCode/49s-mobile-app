import { getApp } from '@react-native-firebase/app';
import {
  collection,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  Timestamp,
  where,
} from '@react-native-firebase/firestore';
import { getDB } from '../db/database';
import * as drawsRepo from '../db/draws.repo';

export const PAGE_SIZE = 10;

const fdb = () => getFirestore(getApp());

interface DrawDocData {
  gameId: string;
  drawTypeId: string;
  /**
   * UTC instant (Firestore Timestamp). Semantically a London civil time —
   * always project to Europe/London before deriving a civil day/time.
   * See .claude/rules/firestore.md (`draws` collection).
   */
  date: Timestamp;
  balls: number[];
  specialBalls: number[];
  updatedAt?: Timestamp;
  deletedAt?: Timestamp | null;
}

/**
 * Pulls every draw whose server `updatedAt` is newer than the freshest local
 * `serverUpdatedAt` for this drawType — covers creates, edits, and tombstones
 * in a single round trip. Cold start (no local rows) falls back to fetching
 * the newest PAGE_SIZE rows by date so the user has something to render.
 *
 * Tombstones (`deletedAt` set) become local soft-deletes; the row stays in
 * SQLite to preserve the watermark, but every read filters `deletedAt IS NULL`.
 */
export async function refreshDrawsIfStale(drawTypeId: string): Promise<void> {
  const db = getDB();
  const localMax = await drawsRepo.getMaxServerUpdatedAt(db, drawTypeId);
  const drawsRef = collection(fdb(), 'draws');
  const q =
    localMax == null
      ? query(
        drawsRef,
        where('drawTypeId', '==', drawTypeId),
        where('deletedAt', '==', null),
        orderBy('date', 'desc'),
        limit(PAGE_SIZE),
      )
      : query(
        drawsRef,
        where('drawTypeId', '==', drawTypeId),
        where('updatedAt', '>', Timestamp.fromMillis(localMax)),
      );

  const snap = await getDocs(q);
  if (snap.empty) return;

  const toUpsert: Draw[] = [];
  const toTombstone: { id: string; serverUpdatedAt: number | null; deletedAtMs: number }[] = [];

  for (const d of snap.docs) {
    const data = d.data() as DrawDocData;
    const serverUpdatedAt = data.updatedAt?.toMillis() ?? null;
    if (data.deletedAt) {
      toTombstone.push({
        id: d.id,
        serverUpdatedAt,
        deletedAtMs: data.deletedAt.toMillis(),
      });
    } else {
      toUpsert.push({
        _id: d.id,
        gameId: data.gameId,
        drawTypeId: data.drawTypeId,
        date: data.date.toMillis(),
        balls: data.balls,
        specialBalls: data.specialBalls,
        serverUpdatedAt: serverUpdatedAt ?? undefined,
      });
    }
  }

  if (toUpsert.length) await drawsRepo.upsertDraws(db, toUpsert);
  if (toTombstone.length) await drawsRepo.softDeleteDraws(db, toTombstone);
}
