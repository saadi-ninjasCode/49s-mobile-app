import { preloadAppOpen } from './appOpen';
import { applyAdsRequestConfiguration, initializeAdsSdk } from './config';
import { gatherConsentOnBoot } from './consent';

/**
 * Pre-mount ads boot orchestrator. Called from `AppBoot`'s first effect, *in
 * parallel* with `bootstrap()` and the age-gate pref read — so the SDK init,
 * UMP consent gather, and `AppOpenAd.load()` are all already in flight before
 * `AdsConsentProvider` is even mounted.
 *
 * Why a plain non-React module: `AdsConsentProvider` only mounts after the
 * age-gate state machine reaches `"ready"`, and the React effects there
 * couldn't possibly fire until after the user has decided. By moving the
 * network work into a module that runs from `AppBoot`'s first effect, we let
 * the ad bytes download while the age-gate modal is still on screen.
 *
 * Safety: `preloadAppOpen()` only calls `.load()`. We never call `.show()`
 * here. `attemptShow()` is guarded inside `appOpen.ts` by:
 *   - `armColdStartShow()` being called by `AdsConsentProvider` only when
 *     UMP returned `canRequestAds === true`.
 *   - Per-show gates (sensitive cooldown, ad-free pref, suppression).
 *
 * Idempotency: the in-flight `resultPromise` is cached. Subsequent calls
 * (Fast Refresh in dev, or `AdsConsentProvider` mounting after this module
 * was already kicked) get the same promise and the same snapshot.
 */

let resultPromise: Promise<AdsBootResult> | null = null;
let snapshot: AdsBootSnapshot = {
  initStarted: false,
  initResolved: false,
  consentResolved: false,
  result: null,
};

const listeners = new Set<(s: AdsBootSnapshot) => void>();

const emit = (next: Partial<AdsBootSnapshot>): void => {
  snapshot = { ...snapshot, ...next };
  for (const l of listeners) {
    try {
      l(snapshot);
    } catch {
      /* listener bugs must not break boot */
    }
  }
};

/**
 * Kick SDK init + UMP gather + App Open preload in parallel. Safe to call
 * many times; only the first call does work. Returns a promise that resolves
 * to the UMP result.
 *
 * SDK init failures are non-fatal — the promise still resolves (with
 * `canRequestAds: false`) so callers can take a clean "no ads" path.
 */
export const startAdsBootEarly = (): Promise<AdsBootResult> => {
  if (resultPromise) return resultPromise;

  emit({ initStarted: true });

  // Init in the background; failures collapse to `canRequestAds: false`.
  const initPromise = (async () => {
    try {
      await applyAdsRequestConfiguration();
      await initializeAdsSdk();
      // Preload AFTER initialize() — the SDK requires init before load.
      preloadAppOpen();
    } catch (e) {
      if (__DEV__) console.warn('[bootSequence] SDK init failed:', e);
      throw e;
    }
  })()
    .then(() => emit({ initResolved: true }))
    .catch(() => emit({ initResolved: true }));

  // UMP is independent of SDK init — gather in parallel.
  const consentPromise = gatherConsentOnBoot();

  resultPromise = (async () => {
    const [result] = await Promise.all([consentPromise, initPromise]);
    emit({ consentResolved: true, result });
    return result;
  })();

  return resultPromise;
};

/** Sync snapshot for components that mount after `startAdsBootEarly()` ran. */
export const getAdsBootStateSnapshot = (): AdsBootSnapshot => snapshot;

/**
 * Subscribe to snapshot changes. Returns an unsubscribe function. The
 * listener is NOT called immediately on subscribe — read `getAdsBootStateSnapshot()`
 * first if you need the current value.
 */
export const subscribeAdsBoot = (listener: (s: AdsBootSnapshot) => void): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

/**
 * Await the UMP result. If `startAdsBootEarly()` was never called, returns
 * `null` — caller should treat as "no early boot, run the legacy path".
 */
export const awaitAdsBootResult = (): Promise<AdsBootResult> | null => resultPromise;
