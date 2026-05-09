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

interface DrawDocData {
  gameId: string;
  drawTypeId: string;
  date: Timestamp;
  balls: number[];
  specialBalls: number[];
}

const fdb = () => getFirestore(getApp());

const drawFromSnap = (id: string, data: DrawDocData): Draw => ({
  _id: id,
  gameId: data.gameId,
  drawTypeId: data.drawTypeId,
  date: data.date.toMillis(),
  balls: data.balls,
  specialBalls: data.specialBalls,
});

export async function queryLatestDraws(
  drawTypeId: string,
  max: number,
): Promise<Draw[]> {
  const drawsRef = collection(fdb(), 'draws');
  const q = query(
    drawsRef,
    where('drawTypeId', '==', drawTypeId),
    orderBy('date', 'desc'),
    limit(max),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => drawFromSnap(d.id, d.data() as DrawDocData));
}

/**
 * Returns up to `max` draws strictly newer than `afterMs`, **oldest-first**.
 *
 * ASC ordering is intentional: it lets the caller iterate forward to fill an
 * arbitrarily large gap (e.g. user reopens the app after several days of
 * missed draws) by using the last returned row's date as the next cursor.
 * A DESC `limit(N)` query would silently drop the oldest rows of any gap >N.
 *
 * Requires a Firestore composite index on `(drawTypeId ASC, date ASC)`.
 */
export async function queryDrawsAfter(
  drawTypeId: string,
  afterMs: number,
  max: number,
): Promise<Draw[]> {
  const drawsRef = collection(fdb(), 'draws');
  const q = query(
    drawsRef,
    where('drawTypeId', '==', drawTypeId),
    where('date', '>', Timestamp.fromMillis(afterMs)),
    orderBy('date', 'asc'),
    limit(max),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => drawFromSnap(d.id, d.data() as DrawDocData));
}

export async function queryDrawsBefore(
  drawTypeId: string,
  beforeMs: number,
  max: number,
): Promise<Draw[]> {
  const drawsRef = collection(fdb(), 'draws');
  const q = query(
    drawsRef,
    where('drawTypeId', '==', drawTypeId),
    where('date', '<', Timestamp.fromMillis(beforeMs)),
    orderBy('date', 'desc'),
    limit(max),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => drawFromSnap(d.id, d.data() as DrawDocData));
}

export async function queryDrawsForDay(
  drawTypeId: string,
  startMs: number,
  endMs: number,
): Promise<Draw[]> {
  const drawsRef = collection(fdb(), 'draws');
  const q = query(
    drawsRef,
    where('drawTypeId', '==', drawTypeId),
    where('date', '>=', Timestamp.fromMillis(startMs)),
    where('date', '<', Timestamp.fromMillis(endMs)),
    orderBy('date', 'desc'),
    limit(1),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => drawFromSnap(d.id, d.data() as DrawDocData));
}
