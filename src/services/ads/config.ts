import mobileAds, { MaxAdContentRating } from 'react-native-google-mobile-ads';

/**
 * Global AdMob request configuration.
 *
 * Applied once after the user has passed the age gate and consent has resolved
 * (whether OBTAINED or NOT_REQUIRED) — before any ad load. Encodes the
 * gambling-adjacent-content policy stance for this app:
 *
 * - `maxAdContentRating: MA` — Mature 17+ creatives only.
 * - `tagForChildDirectedTreatment: false` — explicit, since lottery content is 18+.
 * - `tagForUnderAgeOfConsent: false` — UMP form decides EEA/UK consent path.
 * - `testDeviceIdentifiers` — comma-separated env var so the team can register
 *   real devices without committing them. Always populated from `TestIds.*`
 *   anyway in `__DEV__`, so this matters most for QA on production builds.
 */
export const applyAdsRequestConfiguration = async (): Promise<void> => {
  const testDevicesRaw = process.env.EXPO_PUBLIC_ADMOB_TEST_DEVICES;
  const testDeviceIdentifiers = testDevicesRaw
    ? testDevicesRaw.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  await mobileAds().setRequestConfiguration({
    maxAdContentRating: MaxAdContentRating.MA,
    tagForChildDirectedTreatment: false,
    tagForUnderAgeOfConsent: false,
    testDeviceIdentifiers,
  });
};

/**
 * Wraps `MobileAds().initialize()` so callers don't import the SDK directly,
 * keeping the surface area centralised.
 */
export const initializeAdsSdk = async (): Promise<void> => {
  await mobileAds().initialize();
};
