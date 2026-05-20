import { useTheme } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SettingsRow from '../../components/SettingsRow/SettingsRow';
import { TextDefault } from '../../components/Text';
import { useAdsConsent } from '../../services/ads/AdsConsentProvider';
import { resetConsent } from '../../services/ads/consent';
import { recordSensitiveAction } from '../../services/ads/frequencyCap';
import { runRewardedAd } from '../../services/ads/rewarded';
import { logAdRewardEarned } from '../../services/analytics/events';
import {
  APP_PREF_KEYS,
  getPrefAsNumber,
  setPrefNumber,
} from '../../services/db/appPrefs.repo';
import { useDbChange } from '../../services/db/dbEvents';
import { useStyles } from './styles';

/**
 * Duration of every Settings → "Hide ads" reward, in milliseconds.
 *
 * Same value for both flavours (screen ads + app-open ads) so users have one
 * mental model: "watch an ad, get 30 minutes of peace from that ad type".
 */
const HIDE_ADS_REWARD_MS = 30 * 60_000; // 30 minutes

/**
 * Two parallel reward flows live in this screen — one for "screen" ads
 * (banner + native) and one for "app-open" ads. Both follow the same shape,
 * so we describe each flow as an entry in a const-asserted array and render
 * two rows from the same SettingsRow component.
 *
 * Inferring the shape via `as const` keeps the type definition out of this
 * screen file (per typescript.md).
 */
const HIDE_ADS_CONFIGS = [
  {
    kind: 'screens',
    prefKey: APP_PREF_KEYS.adFreeUntil,
    title: 'Hide ads while using the app',
    subtitleIdle: 'Watch a short video ad to hide on-screen ads for 30 minutes',
    iconIdle: 'gift',
    iconActive: 'shield-alt',
    analyticsKey: 'hide_screen_ads_30m',
  },
  {
    kind: 'appOpen',
    prefKey: APP_PREF_KEYS.appOpenFreeUntil,
    title: 'Hide ads when opening the app',
    subtitleIdle:
      'Watch a short video ad to skip the welcome-back ad for 30 minutes',
    iconIdle: 'gift',
    iconActive: 'shield-alt',
    analyticsKey: 'hide_app_open_ads_30m',
  },
] as const;

type HideKind = (typeof HIDE_ADS_CONFIGS)[number]['kind'];

const formatTimeRemaining = (until: number): string => {
  const ms = until - Date.now();
  if (ms <= 0) return '';
  const mins = Math.ceil(ms / 60_000);
  if (mins < 60) return `${mins} min${mins === 1 ? '' : 's'}`;
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  return remMins === 0 ? `${hrs}h` : `${hrs}h ${remMins}m`;
};

/**
 * Drawer entry for app-level settings.
 *
 * Houses the notification prefs link, the UMP consent re-open (required by
 * Google), and two rewarded-ad "hide ads for 30 minutes" flows — one per
 * ad type the user can suppress.
 *
 * The row subtitle itself doubles as the consent text ("Watch a short video
 * ad to hide on-screen ads for 30 minutes"), so tapping a row goes straight
 * to `runRewardedAd` — no extra confirmation modal in between. Under
 * `__DEV__` also exposes a "Reset consent" debug action.
 */
function Settings() {
  const { colors } = useTheme() as NavigationTheme;
  const styles = useStyles();
  const router = useRouter();
  const db = useSQLiteContext();
  const { privacyOptionsRequired, reopenForm, consentStatus, adsReady, canRequestAds } =
    useAdsConsent();

  const [hideAdsState, setHideAdsState] = useState<Record<HideKind, number | null>>({
    screens: null,
    appOpen: null,
  });
  // While a rewarded ad is loading / playing, disable all hide-ads rows so a
  // second tap can't queue a parallel request. Tracks which row is in flight
  // (or `null` when idle).
  const [busyKind, setBusyKind] = useState<HideKind | null>(null);

  const reloadHideAdsState = useCallback(() => {
    Promise.all([
      getPrefAsNumber(db, APP_PREF_KEYS.adFreeUntil),
      getPrefAsNumber(db, APP_PREF_KEYS.appOpenFreeUntil),
    ])
      .then(([screens, appOpen]) => setHideAdsState({ screens, appOpen }))
      .catch(() => setHideAdsState({ screens: null, appOpen: null }));
  }, [db]);

  useEffect(() => {
    reloadHideAdsState();
  }, [reloadHideAdsState]);

  useDbChange('app_prefs', reloadHideAdsState);

  const adsAvailable = adsReady && canRequestAds;

  const handleNotifications = useCallback(() => {
    // `from=settings` signals the route wrapper to render a back button in the
    // header instead of the drawer hamburger — see app/notification.tsx.
    router.push({ pathname: '/notification', params: { from: 'settings' } });
  }, [router]);

  const handlePrivacy = useCallback(() => {
    router.push({ pathname: '/privacy', params: { from: 'settings' } });
  }, [router]);

  const handleTerms = useCallback(() => {
    router.push({ pathname: '/condition', params: { from: 'settings' } });
  }, [router]);

  const handleConsentReopen = useCallback(() => {
    recordSensitiveAction();
    void reopenForm();
  }, [reopenForm]);

  const handleResetConsent = useCallback(() => {
    resetConsent();
  }, []);

  const handleHideAdsTap = useCallback(
    async (kind: HideKind) => {
      if (busyKind !== null) return;
      const config = HIDE_ADS_CONFIGS.find((c) => c.kind === kind);
      if (!config) return;

      setBusyKind(kind);
      try {
        const result = await runRewardedAd({ db });
        // Grant the reward on either a watched ad OR a load failure (no-fill,
        // offline, network). Offline users would otherwise be stuck — the
        // gate is for monetisation, not punishment. Only a deliberate
        // mid-ad dismiss skips the grant.
        if (result.earned || result.loadFailed) {
          const current = (await getPrefAsNumber(db, config.prefKey)) ?? 0;
          const extended = Math.max(current, Date.now()) + HIDE_ADS_REWARD_MS;
          await setPrefNumber(db, config.prefKey, extended);
          if (result.earned) {
            logAdRewardEarned(config.analyticsKey, HIDE_ADS_REWARD_MS);
          }
        }
      } catch (e) {
        if (__DEV__) console.warn('[Settings] rewarded ad threw:', e);
      } finally {
        setBusyKind(null);
      }
    },
    [busyKind, db],
  );

  const consentSubtitle = privacyOptionsRequired
    ? 'Update your ad personalisation choices'
    : `Status: ${consentStatus.toLowerCase().replace('_', ' ')}`;

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.flex}>
      <ScrollView
        style={[styles.flex, styles.background]}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.sectionWrap}>
          <TextDefault textColor={colors.fontSecondColor} small style={styles.sectionLabel}>
            {'PREFERENCES'}
          </TextDefault>
          <SettingsRow
            icon="bell"
            title="Notifications"
            subtitle="Choose which draws alert you"
            onPress={handleNotifications}
          />
        </View>

        <View style={styles.sectionWrap}>
          <TextDefault textColor={colors.fontSecondColor} small style={styles.sectionLabel}>
            {'PRIVACY & ADS'}
          </TextDefault>
          <SettingsRow
            icon="ad"
            title="Manage ad preferences"
            subtitle={consentSubtitle}
            onPress={handleConsentReopen}
            disabled={!privacyOptionsRequired}
          />

          {HIDE_ADS_CONFIGS.map((config) => {
            const until = hideAdsState[config.kind];
            const isActive = until !== null && until > Date.now();
            const isBusy = busyKind === config.kind;
            return (
              <SettingsRow
                key={config.kind}
                icon={isActive ? config.iconActive : config.iconIdle}
                title={isActive ? `Hidden — ${config.title.toLowerCase()}` : config.title}
                subtitle={
                  isBusy
                    ? 'Loading ad…'
                    : isActive
                      ? `Active for ${formatTimeRemaining(until ?? 0)}`
                      : config.subtitleIdle
                }
                onPress={() => handleHideAdsTap(config.kind)}
                disabled={!adsAvailable || isActive || busyKind !== null}
              />
            );
          })}

          <SettingsRow
            icon="file-signature"
            title="Privacy policy"
            onPress={handlePrivacy}
          />
          <SettingsRow
            icon="file-prescription"
            title="Terms & conditions"
            onPress={handleTerms}
          />
        </View>

        {__DEV__ ? (
          <View style={styles.sectionWrap}>
            <TextDefault textColor={colors.fontSecondColor} small style={styles.sectionLabel}>
              {'DEBUG (DEV ONLY)'}
            </TextDefault>
            <SettingsRow
              icon="redo"
              title="Reset consent state"
              subtitle="Re-triggers UMP form on next launch"
              onPress={handleResetConsent}
            />
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

export default React.memo(Settings);
