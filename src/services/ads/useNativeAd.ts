import { useEffect, useState } from 'react';
import { NativeAd } from 'react-native-google-mobile-ads';
import { AD_IDS } from './adIds';
import { useAdsConsent } from './AdsConsentProvider';
import { useAdFree } from './useAdFree';

/**
 * Shared loader for native ad placements.
 *
 * Both `NativeAdCard` (dashboard, MainCard-look) and `NativeAdCardCompact`
 * (Draw screen, DrawCard-look) use this hook so the load lifecycle —
 * consent gating, ad-free suppression, request, cleanup — lives in one
 * place. The components only worry about presentation.
 *
 * Returns `null` whenever no ad should render:
 *  - SDK not ready yet
 *  - User hasn't granted consent (`canRequestAds === false`)
 *  - User has an active "Hide ads while using the app" reward
 *  - The ad request failed (no-fill, offline, etc.)
 *  - Load still in flight
 *
 * The loaded `NativeAd` is destroyed automatically when the component
 * unmounts.
 */
export function useNativeAd(): NativeAd | null {
  const { adsReady, canRequestAds } = useAdsConsent();
  const adFree = useAdFree();

  const [nativeAd, setNativeAd] = useState<NativeAd | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!adsReady || !canRequestAds || adFree) return;

    let cancelled = false;
    let loaded: NativeAd | null = null;

    NativeAd.createForAdRequest(AD_IDS.native)
      .then((ad) => {
        if (cancelled) {
          ad.destroy();
          return;
        }
        loaded = ad;
        setNativeAd(ad);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        if (__DEV__) {
          const msg = e instanceof Error ? e.message : String(e);
          console.warn('[useNativeAd] failed to load:', msg);
        }
        setFailed(true);
      });

    return () => {
      cancelled = true;
      if (loaded) {
        try {
          loaded.destroy();
        } catch {
          /* best-effort */
        }
      }
    };
  }, [adsReady, canRequestAds, adFree]);

  if (!adsReady || !canRequestAds || adFree || failed) {
    return null;
  }

  return nativeAd;
}
