import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import { APP_PREF_KEYS, isUnlockActive } from '../db/appPrefs.repo';
import { useDbChange } from '../db/dbEvents';

/**
 * Returns `true` while the user has a live "remove ads for N minutes/hours"
 * unlock from a rewarded ad. Banner and (future) interstitial surfaces read
 * this and render `null` while it's true.
 *
 * Reads the pref on mount and re-evaluates on every `app_prefs` table change
 * — so the moment the rewarded ad completes and bumps `ad_free_until`, every
 * mounted banner unmounts itself within the same tick.
 *
 * Note: this does NOT poll for the expiry timestamp passing. When the unlock
 * runs out, the banner won't reappear until the user takes some action that
 * re-renders the component (navigation, refresh, etc.). Good enough — the
 * unlock window is short (≤ 1h) and the user is actively using the app.
 */
export function useAdFree(): boolean {
  const db = useSQLiteContext();
  const [adFree, setAdFree] = useState(false);

  const reload = useCallback(() => {
    isUnlockActive(db, APP_PREF_KEYS.adFreeUntil)
      .then(setAdFree)
      .catch(() => setAdFree(false));
  }, [db]);

  useEffect(() => {
    reload();
  }, [reload]);

  useDbChange('app_prefs', reload);

  return adFree;
}
