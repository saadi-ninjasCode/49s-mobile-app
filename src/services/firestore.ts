import { getApp } from "@react-native-firebase/app";
import {
  collection,
  getDocs,
  getFirestore,
  initializeFirestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  where,
} from "@react-native-firebase/firestore";
import type { SQLiteDatabase } from "expo-sqlite";
import { getDB } from "./db/database";
import * as drawsRepo from "./db/draws.repo";
import * as drawTypesRepo from "./db/drawTypes.repo";
import * as gamesRepo from "./db/games.repo";

type Unsubscribe = () => void;

const _app = getApp();

// Disable Firestore's built-in offline cache — SQLite is now the canonical local
// store. `initializeFirestore` configures the singleton; subsequent
// `getFirestore` calls return the same instance. Re-init on Fast Refresh
// rejects the returned promise, which we swallow.
initializeFirestore(_app, { persistence: false }).catch(() => {});

interface DrawTypeDoc {
  gameId: string;
  name: string;
  icon_name: string;
  hour?: number;
  minute?: number;
  timeZone?: string;
}

interface DrawDoc {
  gameId: string;
  drawTypeId: string;
  date: Timestamp;
  balls: number[];
  specialBalls: number[];
}

interface GameDoc {
  name: string;
  icon_name?: string;
  mainBallCount: number;
  mainBallMax: number;
  specialBallCount: number;
  specialBallMax: number;
  hotColdCount?: number;
  hotBall?: BallStat[];
  coldBall?: BallStat[];
  updatedAt?: Timestamp;
}

const db = () => getFirestore(_app);

const drawTypeFromDoc = (id: string, data: DrawTypeDoc): DrawType => ({
  _id: id,
  gameId: data.gameId,
  name: data.name,
  icon_name: data.icon_name,
  hour: data.hour ?? 0,
  minute: data.minute ?? 0,
  timeZone: data.timeZone ?? "Europe/London",
});

const drawFromDoc = (id: string, data: DrawDoc): Draw => ({
  _id: id,
  gameId: data.gameId,
  drawTypeId: data.drawTypeId,
  date: data.date.toMillis(),
  balls: data.balls,
  specialBalls: data.specialBalls,
});

const gameFromDoc = (id: string, data: GameDoc): Game => ({
  _id: id,
  name: data.name,
  icon_name: data.icon_name ?? "",
  mainBallCount: data.mainBallCount,
  mainBallMax: data.mainBallMax,
  specialBallCount: data.specialBallCount,
  specialBallMax: data.specialBallMax,
  hotColdCount: data.hotColdCount,
  hotBall: data.hotBall,
  coldBall: data.coldBall,
  serverUpdatedAt: data.updatedAt?.toMillis(),
});

const writeDrawToCache = (draw: Draw): void => {
  drawsRepo.upsertDraws(getDB(), [draw]).catch(() => {});
};

export const fetchGames = async (): Promise<Game[]> => {
  const snap = await getDocs(collection(db(), "games"));
  return snap.docs.map((d) => gameFromDoc(d.id, d.data() as GameDoc));
};

/**
 * Pull only games whose server `updatedAt` is newer than the freshest local
 * `serverUpdatedAt`. If no local rows have a baseline yet, fetch the whole
 * collection. Errors are swallowed so a transient network failure during the
 * dashboard sync doesn't crash the UI — local data simply stays as-is.
 */
const refreshGamesIfStale = async (sqlite: SQLiteDatabase): Promise<void> => {
  try {
    const localMax = await gamesRepo.getMaxServerUpdatedAt(sqlite);
    const gamesRef = collection(db(), "games");
    const q =
      localMax == null
        ? query(gamesRef)
        : query(gamesRef, where("updatedAt", ">", Timestamp.fromMillis(localMax)));
    const snap = await getDocs(q);
    if (snap.empty) return;
    const games = snap.docs.map((d) => gameFromDoc(d.id, d.data() as GameDoc));
    await gamesRepo.upsertGames(sqlite, games);
  } catch {
    /* leave local cache untouched on failure */
  }
};

export const fetchDrawTypes = async (): Promise<DrawType[]> => {
  const snap = await getDocs(collection(db(), "drawTypes"));
  return snap.docs
    .map((d) => drawTypeFromDoc(d.id, d.data() as DrawTypeDoc))
    .sort((a, b) => a.hour - b.hour || a.minute - b.minute);
};

/**
 * Mounts onSnapshot listeners (limit 1) per known drawType. Each event upserts
 * the latest draw into SQLite — UI screens read from SQLite and re-render via
 * `useDbChange('draws')`. There is no consumer callback; this is purely a
 * write-through sync. Returns an unsubscribe that closes all listeners.
 *
 * Pre-condition: SQLite has drawType rows (bootstrap completed).
 */
export const startDashboardSync = (): Unsubscribe => {
  let cancelled = false;
  const unsubs: Unsubscribe[] = [];

  (async () => {
    const sqlite = getDB();
    void refreshGamesIfStale(sqlite);

    const drawTypes = await drawTypesRepo.getAllDrawTypes(sqlite);
    if (cancelled) return;

    const drawsRef = collection(db(), "draws");
    drawTypes.forEach((dt) => {
      const q = query(
        drawsRef,
        where("drawTypeId", "==", dt._id),
        orderBy("date", "desc"),
        limit(1),
      );
      const unsub = onSnapshot(q, (snap) => {
        if (cancelled) return;
        const docSnap = snap?.docs?.[0];
        if (!docSnap) return;
        writeDrawToCache(drawFromDoc(docSnap.id, docSnap.data() as DrawDoc));
      });
      unsubs.push(unsub);
    });
  })();

  return () => {
    cancelled = true;
    unsubs.forEach((u) => u());
  };
};
