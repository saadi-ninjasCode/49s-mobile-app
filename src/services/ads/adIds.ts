import { Platform } from 'react-native';
import { TestIds } from 'react-native-google-mobile-ads';

/**
 * Centralised ad-unit IDs.
 *
 * Test IDs are used when EITHER:
 *   - `__DEV__` is true (running in a development client), OR
 *   - `EXPO_PUBLIC_USE_TEST_ADS=true` is set (a runtime override so QA can
 *     force test creatives on a production-flavoured build without an
 *     AdMob policy strike).
 *
 * Otherwise we read real IDs from EAS env vars — never inline a real ID
 * anywhere in the codebase.
 *
 * Env-var naming convention (see also `.env.example` and `IOS_RELEASE_TODO.md`):
 *   EXPO_PUBLIC_ADMOB_BANNER_ANDROID            EXPO_PUBLIC_ADMOB_BANNER_IOS
 *   EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID      EXPO_PUBLIC_ADMOB_INTERSTITIAL_IOS
 *   EXPO_PUBLIC_ADMOB_REWARDED_ANDROID          EXPO_PUBLIC_ADMOB_REWARDED_IOS
 *   EXPO_PUBLIC_ADMOB_REWARDED_INTER_ANDROID    EXPO_PUBLIC_ADMOB_REWARDED_INTER_IOS
 *   EXPO_PUBLIC_ADMOB_APP_OPEN_ANDROID          EXPO_PUBLIC_ADMOB_APP_OPEN_IOS
 *   EXPO_PUBLIC_ADMOB_NATIVE_ANDROID            EXPO_PUBLIC_ADMOB_NATIVE_IOS
 *
 * Each `process.env.EXPO_PUBLIC_*` lookup is written *statically* — Expo's
 * lint rule (`expo/no-dynamic-env-var`) requires this so the bundler can
 * inline the values at build time.
 */

const FORCE_TEST_ADS = process.env.EXPO_PUBLIC_USE_TEST_ADS === 'true';

const fallback = (envValue: string | undefined, testId: string, label: string): string => {
  if (__DEV__ || FORCE_TEST_ADS) return testId;
  if (envValue && envValue.length > 0) return envValue;
  // Defensive: never crash production — fall back to test ID and warn so we
  // notice missing config in the AdMob console (test creatives won't load on
  // a real ad unit so the failure is loud).
  console.warn(`[adIds] Missing ${label} in production build — using test ID`);
  return testId;
};

const isIos = Platform.OS === 'ios';

export const AD_IDS = {
  banner: fallback(
    isIos
      ? process.env.EXPO_PUBLIC_ADMOB_BANNER_IOS
      : process.env.EXPO_PUBLIC_ADMOB_BANNER_ANDROID,
    TestIds.BANNER,
    isIos ? 'EXPO_PUBLIC_ADMOB_BANNER_IOS' : 'EXPO_PUBLIC_ADMOB_BANNER_ANDROID',
  ),
  interstitial: fallback(
    isIos
      ? process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_IOS
      : process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID,
    TestIds.INTERSTITIAL,
    isIos
      ? 'EXPO_PUBLIC_ADMOB_INTERSTITIAL_IOS'
      : 'EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID',
  ),
  rewarded: fallback(
    isIos
      ? process.env.EXPO_PUBLIC_ADMOB_REWARDED_IOS
      : process.env.EXPO_PUBLIC_ADMOB_REWARDED_ANDROID,
    TestIds.REWARDED,
    isIos ? 'EXPO_PUBLIC_ADMOB_REWARDED_IOS' : 'EXPO_PUBLIC_ADMOB_REWARDED_ANDROID',
  ),
  rewardedInterstitial: fallback(
    isIos
      ? process.env.EXPO_PUBLIC_ADMOB_REWARDED_INTER_IOS
      : process.env.EXPO_PUBLIC_ADMOB_REWARDED_INTER_ANDROID,
    TestIds.REWARDED_INTERSTITIAL,
    isIos
      ? 'EXPO_PUBLIC_ADMOB_REWARDED_INTER_IOS'
      : 'EXPO_PUBLIC_ADMOB_REWARDED_INTER_ANDROID',
  ),
  appOpen: fallback(
    isIos
      ? process.env.EXPO_PUBLIC_ADMOB_APP_OPEN_IOS
      : process.env.EXPO_PUBLIC_ADMOB_APP_OPEN_ANDROID,
    TestIds.APP_OPEN,
    isIos ? 'EXPO_PUBLIC_ADMOB_APP_OPEN_IOS' : 'EXPO_PUBLIC_ADMOB_APP_OPEN_ANDROID',
  ),
  native: fallback(
    isIos
      ? process.env.EXPO_PUBLIC_ADMOB_NATIVE_IOS
      : process.env.EXPO_PUBLIC_ADMOB_NATIVE_ANDROID,
    TestIds.NATIVE,
    isIos ? 'EXPO_PUBLIC_ADMOB_NATIVE_IOS' : 'EXPO_PUBLIC_ADMOB_NATIVE_ANDROID',
  ),
} as const;
