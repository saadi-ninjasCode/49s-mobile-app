/**
 * Lightweight gate module for the App Open ad — the only automatic ad
 * format in the app.
 *
 * No spacing cap anymore (per product call: show on every cold start AND on
 * every warm resume after the 30s background threshold; that threshold lives
 * in `appOpen.ts`). The single remaining cross-cutting concern handled here
 * is the **sensitive-action cooldown**: when the user changes a setting or
 * re-opens the consent form, we suppress App Open for 30s so we don't
 * ambush them right after a deliberate action.
 *
 * Rewarded ads bypass this module entirely — they're user-initiated and have
 * no cap of any kind.
 */

const SENSITIVE_ACTION_COOLDOWN_MS = 30_000;

const session = {
  lastSensitiveActionAt: 0,
};

/**
 * Returns true iff an App Open ad is allowed to show right now.
 *
 *  - Blocked if any "sensitive" action happened in the last 30s.
 *  - Otherwise unconstrained (no inter-ad spacing).
 */
export const canShowAppOpen = (): boolean => {
  return Date.now() - session.lastSensitiveActionAt >= SENSITIVE_ACTION_COOLDOWN_MS;
};

/**
 * Kept for API compatibility — App Open's `.show()` path used to record a
 * timestamp here so the next call could be gated. We no longer gate on
 * spacing, so this is a no-op. Still exported so call sites don't have to
 * change shape; if a new spacing rule is added later, this is the seam.
 */
export const recordAppOpenShown = (): void => {
  /* intentional no-op — no spacing rule currently */
};

/**
 * Mark a "sensitive" user action — settings toggle, consent change, etc.
 * App Open stays suppressed for the next 30s.
 */
export const recordSensitiveAction = (): void => {
  session.lastSensitiveActionAt = Date.now();
};

/** Test/debug helper — never call from app code. */
export const _resetSessionForTests = (): void => {
  session.lastSensitiveActionAt = 0;
};
