import { useTheme } from "@react-navigation/native";
import { useSQLiteContext } from "expo-sqlite";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Switch, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AdBannerSlot from "../../components/AdBannerSlot/AdBannerSlot";
import CountPill from "../../components/CountPill/CountPill";
import RewardedConfirmModal from "../../components/RewardedConfirmModal/RewardedConfirmModal";
import TabPill from "../../components/TabPill/TabPill";
import { TextDefault } from "../../components/Text";
import { useAdsConsent } from "../../services/ads/AdsConsentProvider";
import { runRewardedAd } from "../../services/ads/rewarded";
import { logAdRewardEarned } from "../../services/analytics/events";
import {
  consumeGeneratorFreeSpin,
  FREE_ACTION_REWARD,
  getGeneratorFreeSpins,
  grantGeneratorFreeSpins,
} from "../../services/db/appPrefs.repo";
import { useDbChange } from "../../services/db/dbEvents";
import { randomBalls, randomBoosterBall } from "../../utilities/draw";
import { useStyles } from "./styles";

type BallValue = number | "?";
type Mode = "luckyDip" | "pick3";

const PICK_3_COUNT = 3;
const SPIN_INTERVAL_MS = 50;
const SPIN_DURATION_MS = 2000;
const COUNT_OPTIONS = [1, 2, 3, 4, 5] as const;
const MAX_SLOTS = 7;

function placeholders(count: number): BallValue[] {
  return Array.from({ length: count }, () => "?");
}

function Generator() {
  const { colors } = useTheme() as NavigationTheme;
  const styles = useStyles();
  const db = useSQLiteContext();
  const { adsReady, canRequestAds } = useAdsConsent();

  const [mode, setMode] = useState<Mode>("luckyDip");
  const [mainCount, setMainCount] = useState<number>(5);
  const [includeBooster, setIncludeBooster] = useState<boolean>(true);
  const [mainBalls, setMainBalls] = useState<BallValue[]>(placeholders(5));
  const [booster, setBooster] = useState<BallValue | null>("?");
  const [isGenerating, setIsGenerating] = useState(false);

  const [freeSpins, setFreeSpins] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [rewardedBusy, setRewardedBusy] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const slotIds = useMemo(
    () => Array.from({ length: MAX_SLOTS }, (_, i) => `slot-${i}-${Math.random().toString(36).slice(2, 8)}`),
    [],
  );

  const { count, withBooster } = useMemo(() => {
    if (mode === "pick3") return { count: PICK_3_COUNT, withBooster: false };
    return { count: mainCount, withBooster: includeBooster };
  }, [mode, mainCount, includeBooster]);

  useEffect(() => {
    setMainBalls(placeholders(count));
    setBooster(withBooster ? "?" : null);
  }, [count, withBooster]);

  useEffect(
    () => () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    [],
  );

  const drawOnce = useCallback(() => {
    const numbers = randomBalls(count);
    setMainBalls(numbers);
    setBooster(withBooster ? randomBoosterBall(numbers) : null);
  }, [count, withBooster]);

  // Action-quota state — re-read on every `app_prefs` change so the counter
  // stays consistent with Settings (e.g. when a rewarded ad grants more spins).
  const reloadFreeSpins = useCallback(() => {
    getGeneratorFreeSpins(db)
      .then(setFreeSpins)
      .catch(() => setFreeSpins(null));
  }, [db]);

  useEffect(() => {
    reloadFreeSpins();
  }, [reloadFreeSpins]);

  useDbChange("app_prefs", reloadFreeSpins);

  const runSpin = useCallback(() => {
    if (isGenerating) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsGenerating(true);
    intervalRef.current = setInterval(drawOnce, SPIN_INTERVAL_MS);
    timeoutRef.current = setTimeout(() => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      drawOnce();
      setIsGenerating(false);
    }, SPIN_DURATION_MS);
  }, [drawOnce, isGenerating]);

  const generate = useCallback(() => {
    if (isGenerating) return;
    const remaining = freeSpins ?? 0;
    const adsAvailable = adsReady && canRequestAds;

    if (remaining > 0 || !adsAvailable) {
      // Happy path: spin immediately, decrement the quota in the background.
      // If the SDK isn't ready (offline, consent pending) we let the user
      // spin without consuming — refusing would brick the screen for anyone
      // who never made it past UMP.
      if (adsAvailable) {
        void consumeGeneratorFreeSpin(db);
      }
      runSpin();
      return;
    }

    // Quota exhausted — surface the rewarded-ad gate.
    setModalVisible(true);
  }, [isGenerating, freeSpins, adsReady, canRequestAds, runSpin, db]);

  const handleRewardedCancel = useCallback(() => {
    setModalVisible(false);
  }, []);

  const handleRewardedConfirm = useCallback(async () => {
    setRewardedBusy(true);
    try {
      const result = await runRewardedAd({ db });
      // Grant on either a watched ad OR a load failure (no-fill, offline,
      // network). Offline users shouldn't be stuck behind a gate they
      // can't clear. Only a deliberate mid-ad dismiss skips the grant.
      if (result.earned || result.loadFailed) {
        await grantGeneratorFreeSpins(db);
        if (result.earned) {
          logAdRewardEarned("generator_free_spins", FREE_ACTION_REWARD);
        }
        // Consume one credit immediately so the user gets the spin they
        // tapped for — net effect is +4 spins remaining.
        await consumeGeneratorFreeSpin(db);
        runSpin();
      }
    } catch (e) {
      if (__DEV__) console.warn("[Generator] rewarded ad threw:", e);
    } finally {
      setRewardedBusy(false);
      setModalVisible(false);
    }
  }, [db, runSpin]);

  const onSelectMode = useCallback(
    (next: Mode) => {
      if (isGenerating || next === mode) return;
      setMode(next);
    },
    [isGenerating, mode],
  );

  const onSelectCount = useCallback(
    (next: number) => {
      if (isGenerating) return;
      setMainCount(next);
    },
    [isGenerating],
  );

  return (
    <SafeAreaView style={[styles.flex, styles.mainBackground]}>
      <View style={styles.box}>
        <View style={styles.header}>
          <TextDefault textColor={colors.headerBackground} H4 bold center>
            {"Number Generator"}
          </TextDefault>
        </View>
        <View style={styles.boxContainer}>
          <View style={styles.boxInfo}>
            <View style={styles.tabBar}>
              <TabPill
                mode="luckyDip"
                active={mode === "luckyDip"}
                disabled={isGenerating}
                label="Lucky Dip"
                activeColor={colors.headerBackground}
                inactiveColor={colors.fontWhite}
                onSelect={onSelectMode}
              />
              <TabPill
                mode="pick3"
                active={mode === "pick3"}
                disabled={isGenerating}
                label="Pick 3"
                activeColor={colors.headerBackground}
                inactiveColor={colors.fontWhite}
                onSelect={onSelectMode}
              />
            </View>

            {mode === "luckyDip" ? (
              <View style={styles.controls}>
                <TextDefault textColor={colors.fontWhite} small style={styles.controlsLabel}>
                  {"Select how many main numbers to generate:"}
                </TextDefault>
                <View style={styles.countRow}>
                  {COUNT_OPTIONS.map((n) => (
                    <CountPill
                      key={n}
                      value={n}
                      active={n === mainCount}
                      disabled={isGenerating}
                      activeColor={colors.headerBackground}
                      inactiveColor={colors.fontWhite}
                      onSelect={onSelectCount}
                    />
                  ))}
                </View>
                <View style={styles.switchRow}>
                  <TextDefault textColor={colors.fontWhite} small>
                    {"Include Booster Ball"}
                  </TextDefault>
                  <Switch value={includeBooster} onValueChange={setIncludeBooster} disabled={isGenerating} />
                </View>
              </View>
            ) : (
              <View style={styles.controls}>
                <TextDefault textColor={colors.fontWhite} small center style={styles.controlsLabel}>
                  {"3 unique numbers will be generated."}
                </TextDefault>
              </View>
            )}

            <View style={styles.ballRow}>
              {mainBalls.map((value, index) => (
                <View style={styles.ballContainer} key={slotIds[index]}>
                  <TextDefault textColor={colors.headerBackground} bold H4 center>
                    {value}
                  </TextDefault>
                </View>
              ))}
              {booster !== null && (
                <>
                  <View style={styles.boosterDivider} />
                  <View style={styles.boosterBallContainer}>
                    <TextDefault textColor={colors.fontWhite} bold H4 center>
                      {booster}
                    </TextDefault>
                  </View>
                </>
              )}
            </View>

            <TouchableOpacity
              style={[styles.btn, isGenerating && styles.btnDisabled]}
              onPress={generate}
              activeOpacity={0.7}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <TextDefault textColor={colors.white} H4 bold>
                  {"Generate"}
                </TextDefault>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View style={styles.bannerSlot}>
        <AdBannerSlot placement="generator_bottom" />
      </View>

      <RewardedConfirmModal
        visible={modalVisible}
        title="Out of free spins"
        rewardLabel={`${FREE_ACTION_REWARD} more spins`}
        busy={rewardedBusy}
        onConfirm={handleRewardedConfirm}
        onCancel={handleRewardedCancel}
      />
    </SafeAreaView>
  );
}

export default React.memo(Generator);
