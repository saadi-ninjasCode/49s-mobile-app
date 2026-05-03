import { getApp } from "@react-native-firebase/app";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  where,
} from "@react-native-firebase/firestore";

import type {
  DashboardEntry,
  Draw,
  DrawType,
  DrawWithContext,
  Game,
} from "../types";

type Unsubscribe = () => void;

interface DrawTypeDoc {
  gameId: string;
  name: string;
  icon_name: string;
  hour?: number;
  minute?: number;
}

interface DrawDoc {
  gameId: string;
  drawTypeId: string;
  date: Timestamp;
  balls: number[];
  specialBalls: number[];
  pending: boolean;
}

const db = () => getFirestore(getApp());

const computeNextDraw = (hour?: number, minute?: number): number => {
  if (hour === undefined || minute === undefined) return 0;
  const now = new Date();
  const next = new Date();
  next.setHours(hour, minute, 0, 0);
  if (next.getTime() <= now.getTime()) next.setDate(next.getDate() + 1);
  return next.getTime();
};

const drawTypeFromDoc = (id: string, data: DrawTypeDoc): DrawType => ({
  _id: id,
  gameId: data.gameId,
  name: data.name,
  icon_name: data.icon_name,
  next_draw: computeNextDraw(data.hour, data.minute),
});

const drawFromDoc = (id: string, data: DrawDoc): Draw => ({
  _id: id,
  gameId: data.gameId,
  drawTypeId: data.drawTypeId,
  date: data.date.toMillis(),
  balls: data.balls,
  specialBalls: data.specialBalls,
  pending: data.pending,
});

let gamesCache: Game[] | null = null;
let drawTypesCache: DrawType[] | null = null;

export const fetchGames = async (): Promise<Game[]> => {
  if (gamesCache) return gamesCache;
  const snap = await getDocs(collection(db(), "games"));
  gamesCache = snap.docs.map((d) => ({ _id: d.id, ...(d.data() as Omit<Game, "_id">) }));
  return gamesCache;
};

export const fetchDrawTypes = async (): Promise<DrawType[]> => {
  if (drawTypesCache) return drawTypesCache;
  const snap = await getDocs(collection(db(), "drawTypes"));
  drawTypesCache = snap.docs.map((d) => drawTypeFromDoc(d.id, d.data() as DrawTypeDoc));
  return drawTypesCache;
};

export const getLatestDrawForType = async (drawTypeId: string): Promise<Draw | null> => {
  const q = query(
    collection(db(), "draws"),
    where("drawTypeId", "==", drawTypeId),
    orderBy("date", "desc"),
    limit(1),
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return drawFromDoc(d.id, d.data() as DrawDoc);
};

export const subscribeDashboard = (
  cb: (entries: DashboardEntry[]) => void,
): Unsubscribe => {
  let cancelled = false;
  let drawsUnsub: Unsubscribe | null = null;

  (async () => {
    try {
      const [games, drawTypes] = await Promise.all([fetchGames(), fetchDrawTypes()]);
      if (cancelled) return;

      const gamesById = new Map(games.map((g) => [g._id, g]));
      const emptyEntries = (): DashboardEntry[] =>
        drawTypes.map((dt) => ({
          game: gamesById.get(dt.gameId) ?? ({} as Game),
          drawType: dt,
          latestDraw: null,
        }));

      const q = query(collection(db(), "draws"), orderBy("date", "desc"));
      drawsUnsub = onSnapshot(
        q,
        (snap) => {
          const latestByDrawType = new Map<string, Draw>();
          snap?.forEach((d) => {
            const draw = drawFromDoc(d.id, d.data() as DrawDoc);
            if (!latestByDrawType.has(draw.drawTypeId)) {
              latestByDrawType.set(draw.drawTypeId, draw);
            }
          });

          const entries: DashboardEntry[] = drawTypes.map((dt) => ({
            game: gamesById.get(dt.gameId) ?? ({} as Game),
            drawType: dt,
            latestDraw: latestByDrawType.get(dt._id) ?? null,
          }));

          cb(entries);
        },
        (error) => {
          console.warn("subscribeDashboard onSnapshot error:", error);
          cb(emptyEntries());
        },
      );
    } catch (error) {
      console.warn("subscribeDashboard setup error:", error);
      if (!cancelled) cb([]);
    }
  })();

  return () => {
    cancelled = true;
    drawsUnsub?.();
  };
};

export interface SubscribeDrawsOptions {
  date?: Date | null;
  recentLimit?: number;
}

export const subscribeDrawsForDrawType = (
  drawTypeId: string,
  cb: (draws: DrawWithContext[]) => void,
  options?: SubscribeDrawsOptions,
): Unsubscribe => {
  let cancelled = false;
  let drawsUnsub: Unsubscribe | null = null;

  (async () => {
    try {
      const [games, drawTypes] = await Promise.all([fetchGames(), fetchDrawTypes()]);
      if (cancelled) return;

      const drawType = drawTypes.find((dt) => dt._id === drawTypeId);
      const game = drawType ? games.find((g) => g._id === drawType.gameId) : undefined;
      if (!drawType || !game) {
        cb([]);
        return;
      }

      const drawsRef = collection(db(), "draws");
      let q;
      if (options?.date) {
        const start = new Date(options.date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(end.getDate() + 1);
        q = query(
          drawsRef,
          where("drawTypeId", "==", drawTypeId),
          where("date", ">=", Timestamp.fromDate(start)),
          where("date", "<", Timestamp.fromDate(end)),
          limit(1),
        );
      } else {
        q = query(
          drawsRef,
          where("drawTypeId", "==", drawTypeId),
          orderBy("date", "desc"),
          limit(options?.recentLimit ?? 60),
        );
      }

      drawsUnsub = onSnapshot(
        q,
        (snap) => {
          const draws: DrawWithContext[] = (snap?.docs ?? []).map((d) => ({
            ...drawFromDoc(d.id, d.data() as DrawDoc),
            game,
            drawType,
          }));
          cb(draws);
        },
        (error) => {
          console.warn("subscribeDrawsForDrawType onSnapshot error:", error);
          cb([]);
        },
      );
    } catch (error) {
      console.warn("subscribeDrawsForDrawType setup error:", error);
      if (!cancelled) cb([]);
    }
  })();

  return () => {
    cancelled = true;
    drawsUnsub?.();
  };
};

export const getDeviceDocRef = (token: string) => doc(db(), "devices", token);

export const readDeviceDoc = async (token: string) => {
  const snap = await getDoc(getDeviceDocRef(token));
  return snap.exists() ? snap.data() : null;
};
