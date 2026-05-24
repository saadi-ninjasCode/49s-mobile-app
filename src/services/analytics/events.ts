import analytics from '@react-native-firebase/analytics';

/**
 * Typed Firebase Analytics event helpers.
 *
 * All ad-related telemetry funnels through this module so we can:
 *  1. Tune frequency caps from real data (impression / cap-skip ratios).
 *  2. Spot policy-relevant issues (consent denied rate, age-gate refusal rate).
 *  3. Track rewarded-ad earn-through rate (a known invalid-traffic signal
 *     if it diverges wildly from Google's own dashboard).
 *
 * Every helper swallows its own errors — analytics failing must never break
 * a user-facing flow.
 */

const safeLog = (name: string, params?: Record<string, string | number | boolean>) => {
  try {
    void analytics().logEvent(name, params);
  } catch (e) {
    if (__DEV__) console.warn(`[analytics] logEvent ${name} threw:`, e);
  }
};

// ----------------------------------------------------------------------------
// Ad lifecycle
// ----------------------------------------------------------------------------

export const logAdImpression = (
  format: AdFormat,
  placement: AdPlacement,
  adUnitId?: string,
): void => {
  safeLog('ad_impression', {
    format,
    placement,
    ...(adUnitId ? { ad_unit_id: adUnitId } : {}),
  });
};

export const logAdClick = (format: AdFormat, placement: AdPlacement): void => {
  safeLog('ad_click', { format, placement });
};

export const logAdFailedToLoad = (
  format: AdFormat,
  placement: AdPlacement,
  errorCode?: string | number,
): void => {
  safeLog('ad_failed_to_load', {
    format,
    placement,
    ...(errorCode !== undefined ? { error_code: String(errorCode) } : {}),
  });
};

export const logAdRewardEarned = (unlockKey: string, amount: number): void => {
  safeLog('ad_reward_earned', { unlock_key: unlockKey, amount });
};

export const logInterstitialSkippedByCap = (reason: string): void => {
  safeLog('interstitial_skipped_by_cap', { reason });
};

// ----------------------------------------------------------------------------
// Consent
// ----------------------------------------------------------------------------

export const logConsentStatus = (status: AdsConsentStatusValue, region?: string): void => {
  safeLog('consent_status', {
    status,
    ...(region ? { region } : {}),
  });
};
