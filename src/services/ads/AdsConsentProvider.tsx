import { useSQLiteContext } from "expo-sqlite";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { logConsentStatus } from "../analytics/events";
import { APP_PREF_KEYS, setPrefBoolean } from "../db/appPrefs.repo";
import { armColdStartShow } from "./appOpen";
import { awaitAdsBootResult, startAdsBootEarly } from "./bootSequence";
import { gatherConsentOnBoot, showPrivacyOptionsForm } from "./consent";

/**
 * Owns the consent + cold-start show lifecycle.
 *
 * The heavy lifting (SDK init, UMP gather, `AppOpenAd.load()`) has already
 * been kicked off by `bootSequence.startAdsBootEarly()` at module-load in
 * `app/_layout.tsx` — well before this provider mounts. This component:
 *
 *   1. Adopts that in-flight work via `awaitAdsBootResult()`.
 *   2. Persists `canRequestAdsCache` to SQLite for the next launch's hot path.
 *   3. If `canRequestAds === true`, arms `armColdStartShow(db)`. When the
 *      App Open ad's LOADED event fires, the ad appears on top of the
 *      already-visible Dashboard. No splash gating on the ad — the Dashboard
 *      mounts as soon as `bootstrap()` finishes.
 */

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

  // Guard against double-bootstrap in dev (React strict mode + fast refresh).
  const bootstrappedRef = useRef(false);
  const appOpenCleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (bootstrappedRef.current) return;
    bootstrappedRef.current = true;

    (async () => {
      // Adopt the in-flight early boot (`app/_layout.tsx` kicked this at
      // module load). If for some reason early boot never started — e.g. a
      // future entry path — start it now so we don't deadlock.
      const result = await (awaitAdsBootResult() ?? startAdsBootEarly());

      setConsentStatus(result.status);
      setCanRequestAds(result.canRequestAds);
      setPrivacyOptionsRequired(result.privacyOptionsRequired);
      logConsentStatus(result.status);

      // Persist the freshest consent flag for next launch's hot path.
      setPrefBoolean(db, APP_PREF_KEYS.canRequestAdsCache, result.canRequestAds).catch(() => {});

      if (!result.canRequestAds) return;

      setAdsReady(true);
      appOpenCleanupRef.current = armColdStartShow(db);
    })();

    return () => {
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
      {children}
    </AdsConsentContext.Provider>
  );
}

export default AdsConsentProvider;

export function useAdsConsent(): AdsConsentContextValue {
  return useContext(AdsConsentContext);
}
