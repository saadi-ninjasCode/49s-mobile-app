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
  updatedAt?: Timestamp;
  deletedAt?: Timestamp | null;
}

const fdb = () => getFirestore(getApp());

const drawFromSnap = (id: string, data: DrawDocData): Draw => ({
  _id: id,
  gameId: data.gameId,
  drawTypeId: data.drawTypeId,
  date: data.date.toMillis(),
  balls: data.balls,
  specialBalls: data.specialBalls,
  serverUpdatedAt: data.updatedAt?.toMillis(),
});

// Tombstoned docs come back from history-page / date-filter queries the same
// as live ones — strip them at the boundary so the caller never inserts a
// soft-deleted draw or renders one. The page-size cursor is unaffected.
const isLive = (data: DrawDocData): boolean => !data.deletedAt;

export async function queryLatestDraws(
  drawTypeId: string,
  max: number,
): Promise<Draw[]> {
  const drawsRef = collection(fdb(), 'draws');
  const q = query(
    drawsRef,
    where('drawTypeId', '==', drawTypeId),
    where('deletedAt', '==', null),
    orderBy('date', 'desc'),
    limit(max),
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, data: d.data() as DrawDocData }))
    .filter((x) => isLive(x.data))
    .map((x) => drawFromSnap(x.id, x.data));
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
    where('deletedAt', '==', null),
    where('date', '<', Timestamp.fromMillis(beforeMs)),
    orderBy('date', 'desc'),
    limit(max),
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, data: d.data() as DrawDocData }))
    .filter((x) => isLive(x.data))
    .map((x) => drawFromSnap(x.id, x.data));
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
    where('deletedAt', '==', null),
    where('date', '>=', Timestamp.fromMillis(startMs)),
    where('date', '<', Timestamp.fromMillis(endMs)),
    orderBy('date', 'desc'),
    limit(1),
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, data: d.data() as DrawDocData }))
    .filter((x) => isLive(x.data))
    .map((x) => drawFromSnap(x.id, x.data));
}
