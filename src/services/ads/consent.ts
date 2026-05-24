import {
  AdsConsent,
  AdsConsentDebugGeography,
  AdsConsentPrivacyOptionsRequirementStatus,
  AdsConsentStatus,
} from 'react-native-google-mobile-ads';

/**
 * UMP (User Messaging Platform) consent wrapper — **Android-only release**.
 *
 * `gatherConsentOnBoot()` runs the UMP form fetch + show-if-required dance and
 * returns enough info for the rest of the app to decide whether to load ads.
 *
 * Errors are deliberately swallowed and returned as `{ canRequestAds: false }` —
 * a failed consent dance must never crash the app shell. The ad layer will
 * simply render nothing until the next launch retries.
 *
 * ⚠️ iOS release prerequisite — see `IOS_RELEASE_TODO.md`.
 * Before re-enabling iOS we MUST call the App Tracking Transparency prompt
 * here, BEFORE `AdsConsent.gatherConsent()`. The required steps:
 *   1. Re-install `expo-tracking-transparency`.
 *   2. Re-add its plugin entry to `app.json`.
 *   3. Re-add `userTrackingUsageDescription` to the `react-native-google-mobile-ads`
 *      plugin entry (or set `NSUserTrackingUsageDescription` on `ios.infoPlist`).
 *   4. Restore the `requestAttIfNeeded()` helper from git history (was in
 *      this file at the v1 commit) and call it inside `gatherConsentOnBoot`
 *      before `AdsConsent.gatherConsent()`.
 * Without ATT the iOS App Store rejects apps that use `IDFA` (which AdMob
 * does, via the SDK), and Google's UMP form expects ATT to have been
 * requested first.
 */

const toStatusValue = (status: AdsConsentStatus): AdsConsentStatusValue => {
  switch (status) {
    case AdsConsentStatus.OBTAINED:
      return 'OBTAINED';
    case AdsConsentStatus.REQUIRED:
      return 'REQUIRED';
    case AdsConsentStatus.NOT_REQUIRED:
      return 'NOT_REQUIRED';
    case AdsConsentStatus.UNKNOWN:
    default:
      return 'UNKNOWN';
  }
};

/**
 * First-run consent sequence (Android):
 *   1. UMP gatherConsent — fetches info and shows form if REQUIRED.
 *
 * Returns the boot-state info we need: status string + whether we can request ads.
 */
export const gatherConsentOnBoot = async (): Promise<{
  readonly status: AdsConsentStatusValue;
  readonly canRequestAds: boolean;
  readonly privacyOptionsRequired: boolean;
}> => {
  try {
    // [iOS] Insert `await requestAttIfNeeded()` here before re-enabling iOS.
    const info = await AdsConsent.gatherConsent({
      debugGeography: AdsConsentDebugGeography.EEA,
      // testDeviceIdentifiers: ['F339BB1AB74569EEF0E8A608532372A1','551FDC6DEF8015CFCCCB534091E2DE90'],
    });
    return {
      status: toStatusValue(info.status),
      canRequestAds: info.canRequestAds,
      privacyOptionsRequired:
        info.privacyOptionsRequirementStatus === AdsConsentPrivacyOptionsRequirementStatus.REQUIRED,
    };
  } catch (e) {
    console.warn('[ads/consent] gatherConsent failed (non-fatal):', e);
    return {
      status: 'UNKNOWN',
      canRequestAds: false,
      privacyOptionsRequired: false,
    };
  }
};

/**
 * Re-opens the UMP privacy options form. Called from the Settings screen so
 * EEA/UK users can revoke or change their consent at any time (required by
 * Google's UMP policy).
 */
export const showPrivacyOptionsForm = async (): Promise<void> => {
  try {
    await AdsConsent.showPrivacyOptionsForm();
  } catch (e) {
    console.warn('[ads/consent] showPrivacyOptionsForm failed:', e);
  }
};

/**
 * Debug-only: reset the UMP SDK state so the consent form re-appears on next launch.
 * Wired into Settings under `__DEV__`.
 */
export const resetConsent = (): void => {
  try {
    AdsConsent.reset();
  } catch (e) {
    console.warn('[ads/consent] reset failed:', e);
  }
};
