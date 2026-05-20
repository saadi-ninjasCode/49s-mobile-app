import * as SplashScreen from "expo-splash-screen";
import { useSQLiteContext } from "expo-sqlite";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import BootSplash from "../../components/BootSplash";
import { logConsentStatus } from "../analytics/events";
import { APP_PREF_KEYS, setPrefBoolean } from "../db/appPrefs.repo";
import { armColdStartShow } from "./appOpen";
import { awaitAdsBootResult, startAdsBootEarly } from "./bootSequence";
import { gatherConsentOnBoot, showPrivacyOptionsForm } from "./consent";

/**
 * Owns the consent + cold-start show lifecycle.
 *
 * The heavy lifting (SDK init, UMP gather, `AppOpenAd.load()`) has already
 * been kicked off by `bootSequence.startAdsBootEarly()` from `app/_layout.tsx`
 * — usually *before* this provider mounts. This component just:
 *
 *   1. Adopts that in-flight work via `awaitAdsBootResult()` / snapshot.
 *   2. Persists `canRequestAdsCache` to SQLite for the next launch's hot path.
 *   3. If `canRequestAds === true`, arms the cold-start show via
 *      `armColdStartShow(db, hideSplash)`. If the preloaded ad is already
 *      fresh, it shows within a frame.
 *   4. When the cold-start sequence finishes (ad closed, gate refused, load
 *      failed, or 10s window expired), `hideSplash` fires:
 *        - `SplashScreen.hideAsync()` drops the native Expo splash.
 *        - `setSplashVisible(false)` removes the JS BootSplash overlay.
 *      Both happen together so the Dashboard never flashes through a seam.
 *
 * A 14s failsafe guarantees the splash drops no matter what (failsafe is
 * larger than `COLD_START_WINDOW_MS` so the window can resolve first).
 */

const SPLASH_FAILSAFE_MS = 14_000;

const overlayStyles = StyleSheet.create({
  host: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject },
});

const DEFAULT_VALUE: AdsConsentContextValue = {
  adsReady: false,
  canRequestAds: false,
  consentStatus: "UNKNOWN",
  privacyOptionsRequired: false,
  reopenForm: async () => {
    /* no-op default */
  },
};

const AdsConsentContext = createContext<AdsConsentContextValue>(DEFAULT_VALUE);

interface AdsConsentProviderProps {
  readonly children: React.ReactNode;
}

function AdsConsentProvider({ children }: Readonly<AdsConsentProviderProps>) {
  const db = useSQLiteContext();
  const [adsReady, setAdsReady] = useState(false);
  const [canRequestAds, setCanRequestAds] = useState(false);
  const [consentStatus, setConsentStatus] = useState<AdsConsentStatusValue>("UNKNOWN");
  const [privacyOptionsRequired, setPrivacyOptionsRequired] = useState(false);
  // Splash stays up until cold-start App Open resolves OR failsafe trips OR
  // we know there's no ad to wait for (no consent / init failed).
  const [splashVisible, setSplashVisible] = useState(true);

  // Guard against double-bootstrap in dev (React strict mode + fast refresh).
  const bootstrappedRef = useRef(false);
  const appOpenCleanupRef = useRef<(() => void) | null>(null);
  const splashHiddenRef = useRef(false);

  useEffect(() => {
    if (bootstrappedRef.current) return;
    bootstrappedRef.current = true;

    // Idempotent: every cold-start exit path calls this; first call wins.
    // Drops both the native Expo splash AND the JS overlay together so the
    // Dashboard never appears through a seam.
    const hideSplash = () => {
      if (splashHiddenRef.current) return;
      splashHiddenRef.current = true;
      SplashScreen.hideAsync().catch(() => {});
      setSplashVisible(false);
    };

    // Failsafe: no matter what the ad SDK does, the dashboard becomes visible
    // within 14s of mounting. Protects against a runaway loader or a missing
    // CLOSED event. Must be > COLD_START_WINDOW_MS so the ad window can
    // resolve first.
    const failsafe = setTimeout(hideSplash, SPLASH_FAILSAFE_MS);

    (async () => {
      // Adopt the in-flight early boot (`app/_layout.tsx` kicked this on
      // mount). If for some reason early boot never started — e.g. a future
      // entry path — start it now so we don't deadlock.
      const result = await (awaitAdsBootResult() ?? startAdsBootEarly());

      setConsentStatus(result.status);
      setCanRequestAds(result.canRequestAds);
      setPrivacyOptionsRequired(result.privacyOptionsRequired);
      logConsentStatus(result.status);

      // Persist the freshest consent flag for next launch's hot path.
      setPrefBoolean(db, APP_PREF_KEYS.canRequestAdsCache, result.canRequestAds).catch(() => {});

      if (!result.canRequestAds) {
        // No consent — nothing to show. Drop both splash layers immediately.
        hideSplash();
        return;
      }

      // Init has already been awaited inside the bootSequence promise. If it
      // failed, the SDK init promise rejected silently and we still got
      // canRequestAds from UMP. The arm call will trigger `attemptShow` which
      // gracefully handles a missing/failed ad via its ERROR / window paths.
      setAdsReady(true);
      appOpenCleanupRef.current = armColdStartShow(db, hideSplash);
    })();

    return () => {
      clearTimeout(failsafe);
      if (appOpenCleanupRef.current) {
        appOpenCleanupRef.current();
        appOpenCleanupRef.current = null;
      }
    };
  }, [db]);

  const reopenForm = useCallback(async () => {
    await showPrivacyOptionsForm();
    // After the form closes the user may have changed consent — re-check.
    const result = await gatherConsentOnBoot();
    setConsentStatus(result.status);
    setCanRequestAds(result.canRequestAds);
    setPrivacyOptionsRequired(result.privacyOptionsRequired);
    setPrefBoolean(db, APP_PREF_KEYS.canRequestAdsCache, result.canRequestAds).catch(() => {});
  }, [db]);

  const value = useMemo<AdsConsentContextValue>(
    () => ({
      adsReady,
      canRequestAds,
      consentStatus,
      privacyOptionsRequired,
      reopenForm,
    }),
    [adsReady, canRequestAds, consentStatus, privacyOptionsRequired, reopenForm],
  );

  return (
    <AdsConsentContext.Provider value={value}>
      <View style={overlayStyles.host}>
        {/* Children (drawer + dashboard) mount immediately so their data
            fetches run in parallel with the ad load. The splash overlay
            sits on top until the cold-start App Open resolves. */}
        {children}
        {splashVisible ? (
          <View style={overlayStyles.overlay}>
            <BootSplash />
          </View>
        ) : null}
      </View>
    </AdsConsentContext.Provider>
  );
}

export default AdsConsentProvider;

export function useAdsConsent(): AdsConsentContextValue {
  return useContext(AdsConsentContext);
}
