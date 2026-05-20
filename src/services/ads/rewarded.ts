import type { SQLiteDatabase } from 'expo-sqlite';
import {
  AdEventType,
  RewardedAd,
  RewardedAdEventType,
} from 'react-native-google-mobile-ads';
import { AD_IDS } from './adIds';

/**
 * On-demand rewarded ad orchestration.
 *
 * Always opened from a `RewardedConfirmModal` confirmation OR a Settings row
 * with a clear "Watch a short video ad to ..." subtitle — Google's rewarded
 * policy requires explicit user opt-in before the ad loads (the SDK doesn't
 * enforce it, but Play review does).
 *
 * Each call creates a fresh `RewardedAd` instance, loads, awaits user
 * decision, resolves with whether the reward was actually earned.
 *
 * The promise resolves `{ earned: true }` only after the SDK fires
 * `EARNED_REWARD` — which Google guarantees fires before `CLOSED` when the
 * user has watched enough of the ad. If the user backs out early they get
 * `CLOSED` without `EARNED_REWARD` and we resolve `{ earned: false }`.
 *
 * NOTE: deliberately bypasses any frequency cap. Rewarded ads are entirely
 * user-initiated and have NO cap — refusing one the user explicitly asked
 * for would produce an inexplicable "did nothing" reaction. They also do
 * NOT count against App Open's own 90s window — the two formats are
 * decoupled. See `frequencyCap.ts` for the App-Open-only logic.
 */

export interface RewardedRunResult {
  /**
   * True iff the SDK fired `EARNED_REWARD` — the user watched enough of the
   * ad to earn the reward. False either because the user dismissed early
   * (silent) or because the ad never loaded (`loadFailed` will be true).
   */
  readonly earned: boolean;
  /**
   * True iff the ad request failed before the ad ever started playing
   * (no-fill, network error, configuration). UI callers should use this to
   * decide whether to surface "Ad unavailable — try again later" feedback;
   * when `loadFailed` is false but `earned` is also false, the user
   * deliberately dismissed mid-ad and no feedback is needed.
   */
  readonly loadFailed: boolean;
}

export const runRewardedAd = async (_opts: {
  readonly db?: SQLiteDatabase;
}): Promise<RewardedRunResult> => {
  return new Promise<RewardedRunResult>((resolve) => {
    const ad = RewardedAd.createForAdRequest(AD_IDS.rewarded);
    let earned = false;
    let loaded = false;
    let settled = false;

    const settle = (result: RewardedRunResult) => {
      if (settled) return;
      settled = true;
      try {
        ad.removeAllListeners();
      } catch {
        /* defensive — listener cleanup is best-effort */
      }
      resolve(result);
    };

    ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
      loaded = true;
      ad.show().catch((e) => {
        if (__DEV__) console.warn('[rewarded] show threw:', e);
        // Show-time error after a successful load — treat as load failure
        // for UX so the user gets feedback.
        settle({ earned: false, loadFailed: true });
      });
    });

    ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
      earned = true;
    });

    ad.addAdEventListener(AdEventType.CLOSED, () => {
      // No frequency-cap accounting — rewarded ads are decoupled from App
      // Open's 90s window. See module header.
      settle({ earned, loadFailed: false });
    });

    ad.addAdEventListener(AdEventType.ERROR, (error) => {
      if (__DEV__) {
        console.warn(
          '[rewarded] failed to load/show:',
          (error as Error)?.message ?? error,
        );
      }
      // If we never got LOADED, this is a true load failure (no-fill, network,
      // bad config). If we did load but errored later, see show().catch above.
      settle({ earned: false, loadFailed: !loaded });
    });

    try {
      ad.load();
    } catch (e) {
      if (__DEV__) console.warn('[rewarded] load threw:', e);
      settle({ earned: false, loadFailed: true });
    }
  });
};
