import React, { useCallback, useState } from "react";
import { View } from "react-native";
import { BannerAd, BannerAdSize } from "react-native-google-mobile-ads";
import { AD_IDS } from "../../services/ads/adIds";
import { useAdsConsent } from "../../services/ads/AdsConsentProvider";
import { useAdFree } from "../../services/ads/useAdFree";
import { logAdClick, logAdFailedToLoad, logAdImpression } from "../../services/analytics/events";
import { useStyles } from "./styles";

/**
 * The single banner-rendering primitive used across every screen.
 *
 * Renders `null` when ANY of the following is true — no error UI, no skeleton,
 * just silent absence so a failed ad never leaks into the app shell:
 *
 *   - AdMob SDK hasn't initialised yet (`!adsReady`)
 *   - User declined consent / consent still pending (`!canRequestAds`)
 *   - User has an active rewarded "ad-free window" unlock (`adFree`)
 *   - The current ad-load attempt failed (`failed`)
 *
 * Uses the adaptive anchored banner so the height tracks device width; we
 * reserve a small `minHeight` on the wrapper to avoid a layout jump while
 * the first ad loads.
 *
 * Note: we deliberately do NOT pass `requestNonPersonalizedAdsOnly`. The UMP
 * consent flow communicates the user's personalisation choice to the SDK via
 * the IAB TCF string automatically — we just have to gate on `canRequestAds`.
 */
function AdBannerSlot(props: Readonly<AdBannerSlotProps>) {
  const { adsReady, canRequestAds } = useAdsConsent();
  const adFree = useAdFree();
  const styles = useStyles();
  const [failed, setFailed] = useState(false);

  const handleFailedToLoad = useCallback(
    (error: Error) => {
      if (__DEV__) {
        console.warn(`[AdBannerSlot:${props.placement}] failed to load:`, error.message);
      }
      logAdFailedToLoad("banner", props.placement, error.message);
      setFailed(true);
    },
    [props.placement],
  );

  const handleImpression = useCallback(() => {
    logAdImpression("banner", props.placement, AD_IDS.banner);
  }, [props.placement]);

  const handleClick = useCallback(() => {
    logAdClick("banner", props.placement);
  }, [props.placement]);

  if (!adsReady || !canRequestAds || adFree || failed) {
    return null;
  }

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={AD_IDS.banner}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        onAdFailedToLoad={handleFailedToLoad}
        onAdImpression={handleImpression}
        onAdClicked={handleClick}
      />
    </View>
  );
}

export default React.memo(AdBannerSlot);
