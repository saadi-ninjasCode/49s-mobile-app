import type { SQLiteDatabase } from 'expo-sqlite';
import { AppState, type NativeEventSubscription } from 'react-native';
import { AdEventType, AppOpenAd } from 'react-native-google-mobile-ads';
import { APP_PREF_KEYS, getPrefAsNumber } from '../db/appPrefs.repo';
import { AD_IDS } from './adIds';
import { canShowAppOpen, recordAppOpenShown } from './frequencyCap';

/**
 * App Open ad — full-screen format shown on every "app open":
 *
 *  1. **Cold start** — when the app process is fresh. After
 *     `initAppOpenAds(db, onColdStartComplete)` kicks the loader, the first
 *     `LOADED` event triggers `attemptShow()` once. The callback fires when
 *     the cold-start "decision" is final — ad shown + closed, OR failed to
 *     load, OR window expired, OR gate refused (sensitive cooldown, ad-free
 *     reward, etc.). Caller (AdsConsentProvider) uses this to delay
 *     un-mounting the BootSplash so the user sees the ad BEFORE the
 *     dashboard.
 *  2. **Warm resume** — when the app comes back from background AFTER the
 *     `MIN_BACKGROUND_MS` threshold (30s). The AppState listener handles
 *     this. No callback — splash isn't involved.
 *
 * In both paths the show is gated by:
 *  - `canShowAppOpen()` — sensitive-action cooldown.
 *  - `app_open_free_until` pref — user opted out via Settings.
 *  - `suppressedReason` — one-shot suppression for notification-tap entries.
 *
 * Closed → reload the next ad so the following open has one ready.
 */

const MIN_BACKGROUND_MS = 30_000; // skip warm-resume show if user only tabbed away briefly
const AD_TTL_MS = 4 * 60 * 60_000; // Google's official 4-hour expiry
const COLD_START_WINDOW_MS = 4_000; // cold-start can fire only if ad loads within this window

let instance: AppOpenAd | null = null;
let loaded = false;
let loading = false;
let loadedAt = 0;
let lastBackgroundedAt = 0;
let subscription: NativeEventSubscription | null = null;
let dbRef: SQLiteDatabase | null = null;

// --- Cold-start state ---
// `coldStartArmed` is true between init and the first attemptShow / timeout.
let coldStartArmed = false;
// `showingColdStart` is true while a cold-start ad is on screen (between
// .show() resolving and CLOSED firing). Tracks whether CLOSED should signal
// completion (vs. a warm-resume CLOSED).
let showingColdStart = false;
let coldStartTimer: ReturnType<typeof setTimeout> | null = null;
let coldStartCompletion: (() => void) | null = null;
// Once-only — signalColdStartComplete is safe to call multiple times.
let coldStartCompletionSignaled = false;

let suppressedReason: 'notification_tap' | null = null;

const isLoadedAndFresh = (): boolean =>
  loaded && Date.now() - loadedAt < AD_TTL_MS;

/**
 * Fire the cold-start callback exactly once. Called from every cold-start
 * exit path: ad CLOSED, ad ERROR, gate refused, window expired.
 */
const signalColdStartComplete = (): void => {
  if (coldStartCompletionSignaled) return;
  coldStartCompletionSignaled = true;
  coldStartArmed = false;
  showingColdStart = false;
  if (coldStartTimer) {
    clearTimeout(coldStartTimer);
    coldStartTimer = null;
  }
  const cb = coldStartCompletion;
  coldStartCompletion = null;
  if (cb) {
    try {
      cb();
    } catch (e) {
      if (__DEV__) console.warn('[appOpen] cold-start callback threw:', e);
    }
  }
};

const ensureInstance = (): AppOpenAd => {
  if (instance) return instance;

  const ad = AppOpenAd.createForAdRequest(AD_IDS.appOpen);
  ad.addAdEventListener(AdEventType.LOADED, () => {
    loaded = true;
    loading = false;
    loadedAt = Date.now();
    // Cold-start: if armed, attempt the show. Either it shows (CLOSED will
    // signal complete later) or a gate refuses (attemptShow signals here).
    if (coldStartArmed && dbRef) {
      coldStartArmed = false;
      if (coldStartTimer) {
        clearTimeout(coldStartTimer);
        coldStartTimer = null;
      }
      void attemptShow(dbRef, true);
    }
  });
  ad.addAdEventListener(AdEventType.ERROR, (error) => {
    if (__DEV__) {
      console.warn('[appOpen] failed to load:', (error as Error)?.message ?? error);
    }
    loaded = false;
    loading = false;
    // If we were waiting on this load for the cold-start show, give up.
    if (coldStartArmed || showingColdStart) {
      signalColdStartComplete();
    }
  });
  ad.addAdEventListener(AdEventType.CLOSED, () => {
    loaded = false;
    setTimeout(() => load(), 0);
    // CLOSED can fire for cold-start OR warm-resume shows. Only signal for
    // cold-start — the AdsConsentProvider is only waiting on that one.
    if (showingColdStart) {
      signalColdStartComplete();
    }
  });

  instance = ad;
  return ad;
};

const load = (): void => {
  const ad = ensureInstance();
  if (isLoadedAndFresh() || loading) return;
  loading = true;
  try {
    ad.load();
  } catch (e) {
    loading = false;
    if (__DEV__) console.warn('[appOpen] load threw:', e);
  }
};

/**
 * Single show-attempt path shared by cold-start and warm-resume. When
 * `fromColdStart === true`, every early return also signals cold-start
 * completion so the BootSplash overlay can come down.
 */
const attemptShow = async (
  db: SQLiteDatabase,
  fromColdStart: boolean = false,
): Promise<void> => {
  if (suppressedReason !== null) {
    if (__DEV__) console.log(`[appOpen] suppressed: ${suppressedReason}`);
    suppressedReason = null;
    if (fromColdStart) signalColdStartComplete();
    return;
  }

  if (!canShowAppOpen()) {
    if (__DEV__) console.log('[appOpen] suppressed: sensitive-action cooldown');
    if (fromColdStart) signalColdStartComplete();
    return;
  }

  try {
    const until = await getPrefAsNumber(db, APP_PREF_KEYS.appOpenFreeUntil);
    if (until !== null && until > Date.now()) {
      if (__DEV__) console.log('[appOpen] suppressed: app_open_free_until active');
      if (fromColdStart) signalColdStartComplete();
      return;
    }
  } catch {
    // Pref read failed — be permissive and continue.
  }

  if (!isLoadedAndFresh()) {
    load();
    if (fromColdStart) signalColdStartComplete();
    return;
  }

  try {
    if (fromColdStart) {
      // Marks "we initiated cold-start show"; the CLOSED handler will signal
      // completion when the ad is finally dismissed.
      showingColdStart = true;
    }
    await ensureInstance().show();
    recordAppOpenShown();
  } catch (e) {
    if (__DEV__) console.warn('[appOpen] show threw:', e);
    loaded = false;
    load();
    if (fromColdStart) signalColdStartComplete();
  }
};

/**
 * Mark the next foreground as "context-broken" — e.g. user tapped a push
 * notification. We suppress the next App Open ad firing (one shot).
 */
export const suppressAppOpenForNextResume = (): void => {
  suppressedReason = 'notification_tap';
};

/**
 * Kick the App Open ad load without arming the cold-start show path.
 *
 * Called from `bootSequence.startAdsBootEarly()` as soon as the app boots,
 * in parallel with `bootstrap()` / age-gate read / UMP. The ad bytes can be
 * fetched while React is still mounting providers and the age-gate modal is
 * still up. The SDK respects the cached UMP consent string from the previous
 * session, so the request is policy-safe; nothing is *shown* until
 * `armColdStartShow` runs and `attemptShow` has cleared the consent gate.
 *
 * Idempotent — internal `loaded`/`loading` flags prevent duplicate work.
 */
export const preloadAppOpen = (): void => {
  load();
};

/**
 * Arm the cold-start show path. Called by `AdsConsentProvider` once UMP has
 * resolved with `canRequestAds === true`. If the preloaded ad has already
 * fired LOADED, this synchronously calls `attemptShow(db, true)` and the ad
 * appears within a frame. Otherwise we wait up to `COLD_START_WINDOW_MS` for
 * LOADED; if the timer expires first, we signal cold-start completion so the
 * splash drops.
 *
 * Also mounts the warm-resume `AppState` listener (idempotent — subsequent
 * arms reuse the existing listener).
 *
 * `onColdStartComplete` is invoked exactly once when the cold-start sequence
 * resolves (ad closed, gate refused, load failed, or window expired).
 * Returns a cleanup function (called by `AdsConsentProvider` on unmount).
 */
export const armColdStartShow = (
  db: SQLiteDatabase,
  onColdStartComplete?: () => void,
): (() => void) => {
  dbRef = db;
  coldStartCompletion = onColdStartComplete ?? null;
  coldStartCompletionSignaled = false;

  if (isLoadedAndFresh()) {
    // Preload (or a previous arm) already produced a fresh ad — show now.
    void attemptShow(db, true);
  } else {
    coldStartArmed = true;
    coldStartTimer = setTimeout(() => {
      if (coldStartArmed) {
        signalColdStartComplete();
      }
    }, COLD_START_WINDOW_MS);
    // Defensive: ensure a load is in flight even if preload was skipped.
    load();
  }

  if (subscription) {
    return () => {
      /* no-op, already initialised */
    };
  }

  subscription = AppState.addEventListener('change', (nextState) => {
    if (nextState === 'background' || nextState === 'inactive') {
      lastBackgroundedAt = Date.now();
      return;
    }
    if (nextState !== 'active') return;

    // Warm resume — must have been in background long enough.
    if (lastBackgroundedAt === 0) return;
    const bgMs = Date.now() - lastBackgroundedAt;
    if (bgMs < MIN_BACKGROUND_MS) return;

    void attemptShow(db, false);
  });

  return () => {
    subscription?.remove();
    subscription = null;
    if (coldStartTimer) {
      clearTimeout(coldStartTimer);
      coldStartTimer = null;
    }
    coldStartArmed = false;
    showingColdStart = false;
    coldStartCompletion = null;
    coldStartCompletionSignaled = false;
    dbRef = null;
  };
};

/**
 * Back-compat shim: preload + arm in one call. Prefer the split form so the
 * preload can race ahead of UMP.
 */
export const initAppOpenAds = (
  db: SQLiteDatabase,
  onColdStartComplete?: () => void,
): (() => void) => {
  preloadAppOpen();
  return armColdStartShow(db, onColdStartComplete);
};
