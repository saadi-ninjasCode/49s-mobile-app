import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * App-level preferences stored in the `app_prefs` SQLite table (v2 migration).
 *
 * This is a small key/value store, intentionally separate from the Firestore-synced
 * `games` / `drawTypes` / `draws` tables — values here are device-local user state
 * (AdMob unlocks, consent cache) and never sync.
 *
 * All values are stored as TEXT; numeric values are stringified at write time.
 */

// Canonical key list — extend here when adding a new pref.
export const APP_PREF_KEYS = {
  adFreeUntil: 'ad_free_until',                    // epoch ms — banner + native hidden window
  appOpenFreeUntil: 'app_open_free_until',         // epoch ms — App Open ads suppressed window
  consentStatusCache: 'consent_status_cache',      // last known UMP status string
  canRequestAdsCache: 'can_request_ads_cache',     // "true" | "false" — last known UMP canRequestAds, drives the speculative preload path

  // Action-based reward quotas. User starts with `FREE_ACTION_INITIAL` of each
  // and each watched rewarded ad grants `FREE_ACTION_REWARD` more — see helpers
  // below. Persisted across cold starts so a user who exhausted their quota
  // last session is still gated this session.
  generatorFreeSpins: 'generator_free_spins',          // int as string
  drawFreeNavigations: 'draw_free_navigations',         // int as string
} as const;

/**
 * How many free actions the user gets before the rewarded-ad gate appears.
 * Applied on first read of each quota pref (no eager seeding — the row only
 * gets written when the quota is first consumed, keeping the DB sparse).
 */
export const FREE_ACTION_INITIAL = 5;
/**
 * How many actions a single watched rewarded ad grants back.
 */
export const FREE_ACTION_REWARD = 5;

export type AppPrefKey = (typeof APP_PREF_KEYS)[keyof typeof APP_PREF_KEYS];

interface PrefRow {
  key: string;
  value: string;
  updatedAt: number;
}

export const getPref = async (
  db: SQLiteDatabase,
  key: AppPrefKey,
): Promise<string | null> => {
  const row = await db.getFirstAsync<PrefRow>(
    'SELECT * FROM app_prefs WHERE key = ?',
    key,
  );
  return row?.value ?? null;
};

export const setPref = async (
  db: SQLiteDatabase,
  key: AppPrefKey,
  value: string,
): Promise<void> => {
  await db.runAsync(
    `INSERT OR REPLACE INTO app_prefs (key, value, updatedAt) VALUES (?, ?, ?)`,
    key,
    value,
    Date.now(),
  );
};

export const getPrefAsBoolean = async (
  db: SQLiteDatabase,
  key: AppPrefKey,
): Promise<boolean | null> => {
  const raw = await getPref(db, key);
  if (raw === null) return null;
  return raw === 'true';
};

export const setPrefBoolean = async (
  db: SQLiteDatabase,
  key: AppPrefKey,
  value: boolean,
): Promise<void> => {
  await setPref(db, key, value ? 'true' : 'false');
};

export const getPrefAsNumber = async (
  db: SQLiteDatabase,
  key: AppPrefKey,
): Promise<number | null> => {
  const raw = await getPref(db, key);
  if (raw === null) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
};

export const setPrefNumber = async (
  db: SQLiteDatabase,
  key: AppPrefKey,
  value: number,
): Promise<void> => {
  await setPref(db, key, String(value));
};

/**
 * Returns true if a "time-bound unlock" key has a future expiry.
 * Used by banner suppression and rewarded-feature gating.
 */
export const isUnlockActive = async (
  db: SQLiteDatabase,
  key: AppPrefKey,
): Promise<boolean> => {
  const until = await getPrefAsNumber(db, key);
  if (until === null) return false;
  return until > Date.now();
};

/**
 * Loads every pref relevant to ads/UX gating in a single round-trip.
 * Returns a fully-populated `AppPrefs` value with sensible defaults for missing keys.
 */
export const getAllAppPrefs = async (db: SQLiteDatabase): Promise<AppPrefs> => {
  const rows = await db.getAllAsync<PrefRow>('SELECT * FROM app_prefs');
  const map = new Map(rows.map((r) => [r.key, r.value]));

  const readBool = (key: AppPrefKey): boolean | null => {
    const v = map.get(key);
    if (v === undefined) return null;
    return v === 'true';
  };

  const readNumber = (key: AppPrefKey): number | null => {
    const v = map.get(key);
    if (v === undefined) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  return {
    adFreeUntil: readNumber(APP_PREF_KEYS.adFreeUntil),
    appOpenFreeUntil: readNumber(APP_PREF_KEYS.appOpenFreeUntil),
    consentStatusCache: map.get(APP_PREF_KEYS.consentStatusCache) ?? null,
    canRequestAdsCache: readBool(APP_PREF_KEYS.canRequestAdsCache),
    generatorFreeSpins:
      readNumber(APP_PREF_KEYS.generatorFreeSpins) ?? FREE_ACTION_INITIAL,
    drawFreeNavigations:
      readNumber(APP_PREF_KEYS.drawFreeNavigations) ?? FREE_ACTION_INITIAL,
  };
};

// ----------------------------------------------------------------------------
// Action-quota helpers — used by MainCard (draw nav) and Generator (spin).
// Atomic: each consume/grant runs inside a transaction so concurrent taps
// can't double-count.
// ----------------------------------------------------------------------------

const getQuota = async (db: SQLiteDatabase, key: AppPrefKey): Promise<number> => {
  const v = await getPrefAsNumber(db, key);
  return v ?? FREE_ACTION_INITIAL;
};

const consumeQuota = async (db: SQLiteDatabase, key: AppPrefKey): Promise<void> => {
  await db.withTransactionAsync(async () => {
    const current = (await getPrefAsNumber(db, key)) ?? FREE_ACTION_INITIAL;
    const next = Math.max(0, current - 1);
    await setPrefNumber(db, key, next);
  });
};

const grantQuota = async (
  db: SQLiteDatabase,
  key: AppPrefKey,
  amount: number = FREE_ACTION_REWARD,
): Promise<void> => {
  await db.withTransactionAsync(async () => {
    const current = (await getPrefAsNumber(db, key)) ?? FREE_ACTION_INITIAL;
    await setPrefNumber(db, key, current + amount);
  });
};

export const getGeneratorFreeSpins = (db: SQLiteDatabase): Promise<number> =>
  getQuota(db, APP_PREF_KEYS.generatorFreeSpins);

export const consumeGeneratorFreeSpin = (db: SQLiteDatabase): Promise<void> =>
  consumeQuota(db, APP_PREF_KEYS.generatorFreeSpins);

export const grantGeneratorFreeSpins = (
  db: SQLiteDatabase,
  amount?: number,
): Promise<void> => grantQuota(db, APP_PREF_KEYS.generatorFreeSpins, amount);

export const getDrawFreeNavigations = (db: SQLiteDatabase): Promise<number> =>
  getQuota(db, APP_PREF_KEYS.drawFreeNavigations);

export const consumeDrawFreeNavigation = (db: SQLiteDatabase): Promise<void> =>
  consumeQuota(db, APP_PREF_KEYS.drawFreeNavigations);

export const grantDrawFreeNavigations = (
  db: SQLiteDatabase,
  amount?: number,
): Promise<void> => grantQuota(db, APP_PREF_KEYS.drawFreeNavigations, amount);
