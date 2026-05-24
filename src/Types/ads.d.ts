declare global {
  // ---- Consent state machine ----

  /**
   * Whether we have a usable consent decision yet. Aligns with the UMP SDK's
   * ConsentStatus enum but stays string-typed so we don't leak the SDK type globally.
   */
  type AdsConsentStatusValue = 'UNKNOWN' | 'NOT_REQUIRED' | 'REQUIRED' | 'OBTAINED';

  /** Top-level boot state machine. `_layout.tsx` renders a different tree per state. */
  type AppBootState = 'boot' | 'ready';

  /** Result of the early UMP boot path — see `services/ads/bootSequence.ts`. */
  interface AdsBootResult {
    readonly status: AdsConsentStatusValue;
    readonly canRequestAds: boolean;
    readonly privacyOptionsRequired: boolean;
  }

  /** Sync snapshot of the early ads-boot module — see `services/ads/bootSequence.ts`. */
  interface AdsBootSnapshot {
    readonly initStarted: boolean;
    readonly initResolved: boolean;
    readonly consentResolved: boolean;
    readonly result: AdsBootResult | null;
  }

  /** Public surface of the AdsConsentProvider Context. */
  interface AdsConsentContextValue {
    /** True once `MobileAds().initialize()` resolved successfully. */
    readonly adsReady: boolean;
    /** True iff the SDK reports we have valid consent to request ads. */
    readonly canRequestAds: boolean;
    /** Latest known UMP status. */
    readonly consentStatus: AdsConsentStatusValue;
    /** Whether a privacy options form is available to re-open (Settings screen). */
    readonly privacyOptionsRequired: boolean;
    /** Re-open the UMP privacy options form. No-op if not available. */
    readonly reopenForm: () => Promise<void>;
  }

  // ---- AdBannerSlot ----

  interface AdBannerSlotProps {
    readonly placement: AdPlacement;
  }

  // ---- RewardedConfirmModal ----

  interface RewardedConfirmModalProps {
    readonly visible: boolean;
    readonly title: string;
    readonly rewardLabel: string;
    readonly onConfirm: () => void;
    readonly onCancel: () => void;
    readonly busy?: boolean;
  }

  // ---- Native ads (Main FlatList injection) ----

  /**
   * Discriminated union for the Main FlatList — every element is either a
   * real dashboard entry or a placeholder for a native ad slot. The slot's
   * `slotId` is the FlatList key — must be stable across renders so React
   * doesn't unmount/remount the ad on every reload.
   */
  type DashboardListItem =
    | { readonly kind: 'entry'; readonly entry: DashboardEntry }
    | { readonly kind: 'ad'; readonly slotId: string };

  interface NativeAdCardProps {
    readonly slotId: string;
  }

  interface NativeAdCardCompactProps {
    readonly slotId: string;
  }

  interface NativeAdCardLightProps {
    readonly slotId: string;
  }

  /**
   * Draw screen list discriminated union — mirrors `DashboardListItem`
   * (see above) so a `FlatList<DrawListItem>` can interleave real draw rows
   * with native ad slots.
   *
   * `drawIndex` is the row's position in the underlying `DrawWithContext[]`
   * (ignoring ad slots). The Draw renderItem uses it to decide which header
   * ("Latest Result", "Previous Results") to draw on the first/second real
   * row — counting on the FlatList index would shift each time we injected
   * an ad slot.
   */
  type DrawListItem =
    | { readonly kind: 'draw'; readonly draw: DrawWithContext; readonly drawIndex: number }
    | { readonly kind: 'ad'; readonly slotId: string };

  // ---- Settings screen rows ----

  interface SettingsRowProps {
    readonly icon: string;
    readonly title: string;
    readonly subtitle?: string;
    readonly onPress: () => void;
    readonly disabled?: boolean;
  }

  // ---- Ad format taxonomy ----
  // Surfaces are referenced by name in analytics + frequency-cap config.

  type AdFormat =
    | 'banner'
    | 'interstitial'
    | 'rewarded'
    | 'rewardedInterstitial'
    | 'appOpen'
    | 'native';

  type AdPlacement =
    | 'main_footer'
    | 'draw_bottom'
    | 'frequency_bottom'
    | 'generator_bottom'
    | 'main_list_native'
    | 'draw_list_native'
    | 'frequency_list_native'
    | 'main_to_draw_interstitial'
    | 'generator_complete_interstitial'
    | 'generator_bonus_spins_rewarded'
    | 'frequency_unlock_rewarded'
    | 'banner_removal_rewarded'
    | 'skip_ads_rewarded_interstitial'
    | 'app_open';
}

export {};
