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
  type QueryDocumentSnapshot,
  startAfter,
  Timestamp,
  where,
} from "@react-native-firebase/firestore";

type Unsubscribe = () => void;

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
  pending: boolean;
}

const db = () => getFirestore(getApp());

const drawTypeFromDoc = (id: string, data: DrawTypeDoc): DrawType => ({
  _id: id,
  gameId: data.gameId,
  name: data.name,
  icon_name: data.icon_name,
  hour: data.hour ?? 0,
  minute: data.minute ?? 0,
  timeZone: data.timeZone ?? 'Europe/London',
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

export type DashboardEvent =
  | { type: "loading" }
  | { type: "data"; entries: DashboardEntry[] }
  | { type: "error"; error: Error };

export const subscribeDashboard = (
  cb: (event: DashboardEvent) => void,
): Unsubscribe => {
  let cancelled = false;
  const unsubs: Unsubscribe[] = [];

  cb({ type: "loading" });

  (async () => {
    try {
      const [games, drawTypes] = await Promise.all([fetchGames(), fetchDrawTypes()]);
      if (cancelled) return;

      const gamesById = new Map(games.map((g) => [g._id, g]));
      const latestByDrawType = new Map<string, Draw | null>();
      const pendingInitial = new Set(drawTypes.map((dt) => dt._id));

      const emit = () => {
        const entries: DashboardEntry[] = drawTypes.map((dt) => ({
          game: gamesById.get(dt.gameId) ?? ({} as Game),
          drawType: dt,
          latestDraw: latestByDrawType.get(dt._id) ?? null,
        }));
        cb({ type: "data", entries });
      };

      if (drawTypes.length === 0) {
        emit();
        return;
      }

      const drawsRef = collection(db(), "draws");
      drawTypes.forEach((dt) => {
        const q = query(
          drawsRef,
          where("drawTypeId", "==", dt._id),
          orderBy("date", "desc"),
          limit(1),
        );
        const unsub = onSnapshot(
          q,
          (snap) => {
            if (cancelled) return;
            const docSnap = snap?.docs?.[0];
            const draw = docSnap ? drawFromDoc(docSnap.id, docSnap.data() as DrawDoc) : null;
            latestByDrawType.set(dt._id, draw);
            pendingInitial.delete(dt._id);
            if (pendingInitial.size === 0) emit();
          },
          (error) => {
            if (cancelled) return;
            cb({ type: "error", error });
          },
        );
        unsubs.push(unsub);
      });
    } catch (error) {
      if (!cancelled) cb({ type: "error", error: error as Error });
    }
  })();

  return () => {
    cancelled = true;
    unsubs.forEach((u) => u());
  };
};

export interface DrawsPageOptions {
  pageSize?: number;
  after?: QueryDocumentSnapshot<DrawDoc> | null;
  date?: Date | null;
}

export interface DrawsPage {
  draws: DrawWithContext[];
  lastDoc: QueryDocumentSnapshot<DrawDoc> | null;
  hasMore: boolean;
}

export const fetchDrawsPage = async (
  drawTypeId: string,
  options: DrawsPageOptions = {},
): Promise<DrawsPage> => {
  const pageSize = options.pageSize ?? 20;
  const [games, drawTypes] = await Promise.all([fetchGames(), fetchDrawTypes()]);
  const drawType = drawTypes.find((dt) => dt._id === drawTypeId);
  const game = drawType ? games.find((g) => g._id === drawType.gameId) : undefined;
  if (!drawType || !game) return { draws: [], lastDoc: null, hasMore: false };

  const drawsRef = collection(db(), "draws");
  let q;
  if (options.date) {
    const start = new Date(options.date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    q = query(
      drawsRef,
      where("drawTypeId", "==", drawTypeId),
      where("date", ">=", Timestamp.fromDate(start)),
      where("date", "<", Timestamp.fromDate(end)),
      orderBy("date", "desc"),
      limit(1),
    );
  } else if (options.after) {
    q = query(
      drawsRef,
      where("drawTypeId", "==", drawTypeId),
      orderBy("date", "desc"),
      startAfter(options.after),
      limit(pageSize),
    );
  } else {
    q = query(
      drawsRef,
      where("drawTypeId", "==", drawTypeId),
      orderBy("date", "desc"),
      limit(pageSize),
    );
  }

  const snap = await getDocs(q);
  const draws: DrawWithContext[] = snap.docs.map((d) => ({
    ...drawFromDoc(d.id, d.data() as DrawDoc),
    game,
    drawType,
  }));
  const lastDoc = (snap.docs.at(-1) as QueryDocumentSnapshot<DrawDoc> | undefined) ?? null;
  const hasMore = !options.date && snap.docs.length === pageSize;
  return { draws, lastDoc, hasMore };
};

export type DrawsPageCursor = QueryDocumentSnapshot<DrawDoc>;

export const getDeviceDocRef = (token: string) => doc(db(), "devices", token);

export const readDeviceDoc = async (token: string) => {
  const snap = await getDoc(getDeviceDocRef(token));
  return snap.exists() ? snap.data() : null;
};
