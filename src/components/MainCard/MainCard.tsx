import { FontAwesome5 } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, View, type PressableStateCallbackType } from "react-native";
import RewardedConfirmModal from "../RewardedConfirmModal/RewardedConfirmModal";
import { useAdsConsent } from "../../services/ads/AdsConsentProvider";
import { runRewardedAd } from "../../services/ads/rewarded";
import { logAdRewardEarned } from "../../services/analytics/events";
import {
  consumeDrawFreeNavigation,
  FREE_ACTION_REWARD,
  getDrawFreeNavigations,
  grantDrawFreeNavigations,
} from "../../services/db/appPrefs.repo";
import { useDbChange } from "../../services/db/dbEvents";
import { alignment, formatDrawDateBothZones, formatLocalDrawTime, getLocalTimeZone, scale } from "../../utilities";
import Counter from "../Counter/Counter";
import { TextDefault } from "../Text";
import { useStyles } from "./styles";

type FontAwesome5Glyph = React.ComponentProps<typeof FontAwesome5>["name"];

function MainCard(props: Readonly<DashboardEntry>) {
  const { colors } = useTheme() as NavigationTheme;
  const styles = useStyles();
  const router = useRouter();
  const db = useSQLiteContext();
  const { adsReady, canRequestAds } = useAdsConsent();

  const [freeNavs, setFreeNavs] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [rewardedBusy, setRewardedBusy] = useState(false);

  const iconName = props.drawType.icon_name as FontAwesome5Glyph;
  const { gameId, drawTypeId, drawTypeName } = useMemo(
    () => ({
      gameId: props.game._id,
      drawTypeId: props.drawType._id,
      drawTypeName: props.drawType.name,
    }),
    [props.game._id, props.drawType._id, props.drawType.name],
  );

  // Read the persisted quota and re-read on any `app_prefs` change so the
  // counter stays consistent across cards + Settings.
  const reloadFreeNavs = useCallback(() => {
    getDrawFreeNavigations(db)
      .then(setFreeNavs)
      .catch(() => setFreeNavs(null));
  }, [db]);

  useEffect(() => {
    reloadFreeNavs();
  }, [reloadFreeNavs]);

  useDbChange("app_prefs", reloadFreeNavs);

  const navigateToDraw = useCallback(() => {
    router.push({
      pathname: "/draw",
      params: { gameId, drawTypeId, name: drawTypeName, from: "card" },
    });
  }, [router, gameId, drawTypeId, drawTypeName]);

  const handleViewAll = useCallback(() => {
    const remaining = freeNavs ?? 0;
    const adsAvailable = adsReady && canRequestAds;

    if (remaining > 0 || !adsAvailable) {
      // Happy path: navigate immediately, decrement the quota in the background.
      // If the SDK isn't ready (offline, consent pending) we let navigation
      // through without consuming — refusing here would break the app for
      // anyone who never got past the UMP flow.
      navigateToDraw();
      if (adsAvailable) {
        void consumeDrawFreeNavigation(db);
      }
      return;
    }

    // Quota exhausted — surface the rewarded-ad gate.
    setModalVisible(true);
  }, [freeNavs, adsReady, canRequestAds, navigateToDraw, db]);

  const handleRewardedCancel = useCallback(() => {
    setModalVisible(false);
  }, []);

  const handleRewardedConfirm = useCallback(async () => {
    setRewardedBusy(true);
    try {
      const result = await runRewardedAd({ db });
      // Grant the reward on either a watched ad OR a load failure (no-fill,
      // offline, network). Offline users shouldn't be stuck behind a gate
      // they can't physically clear. Only a deliberate mid-ad dismiss skips
      // the grant.
      if (result.earned || result.loadFailed) {
        await grantDrawFreeNavigations(db);
        if (result.earned) {
          logAdRewardEarned("draw_free_navigations", FREE_ACTION_REWARD);
        }
        // Consume one of the freshly-granted credits for this very tap so
        // the user doesn't feel they "wasted" the ad — quota stays at +4.
        await consumeDrawFreeNavigation(db);
        navigateToDraw();
      }
      // result.earned=false && loadFailed=false → user dismissed mid-ad,
      // no grant, no navigation.
    } catch (e) {
      if (__DEV__) console.warn("[MainCard] rewarded ad threw:", e);
    } finally {
      setRewardedBusy(false);
      setModalVisible(false);
    }
  }, [db, navigateToDraw]);

  const ripple = useMemo(
    () => ({ color: colors.headerBackground, foreground: true }),
    [colors.headerBackground],
  );
  const buttonStyle = useCallback(
    ({ pressed }: PressableStateCallbackType) => [styles.viewAllButton, pressed && styles.viewAllButtonPressed],
    [styles],
  );
  const draw = props.latestDraw;
  const dual = formatDrawDateBothZones(draw ? draw.date : null);
  const deviceTz = getLocalTimeZone();
  const showScheduleTimeRow = deviceTz !== props.drawType.timeZone;
  return (
    <View>
      <View style={styles.drawBox}>
        <View style={styles.boxHeader}>
          <TextDefault textColor={colors.headerBackground} H3 bold center>
            {props.drawType.name}
          </TextDefault>
          <FontAwesome5 name={iconName} size={scale(20)} color={colors.drawerTitleColor} />
        </View>
        <View style={styles.boxContainer}>
          <View style={styles.boxInfo}>
            <TextDefault numberOfLines={1} textColor={colors.headerText} H5 bold style={alignment.MTxSmall}>
              {dual ? dual.deviceLocal : "-"}
            </TextDefault>
            {dual && !dual.matchesLondonDate && (
              <TextDefault numberOfLines={1} textColor={colors.fontSecondColor} small style={alignment.MTxSmall}>
                {`${dual.london} (Europe/London)`}
              </TextDefault>
            )}
            <TextDefault numberOfLines={1} textColor={colors.fontSecondColor} style={alignment.MTxSmall}>
              {`${formatLocalDrawTime(props.drawType.hour, props.drawType.minute, props.drawType.timeZone)} (${deviceTz})`}
            </TextDefault>
            {showScheduleTimeRow && (
              <TextDefault numberOfLines={1} textColor={colors.fontSecondColor} small style={alignment.MTxSmall}>
                {`${formatLocalDrawTime(props.drawType.hour, props.drawType.minute, props.drawType.timeZone, props.drawType.timeZone)} (${props.drawType.timeZone})`}
              </TextDefault>
            )}
            <View style={styles.ballRow}>
              {draw && (
                <>
                  {draw.balls.filter(Boolean).map((item, index) => (
                    <View style={[styles.ballContainer, { backgroundColor: colors.yellow }]} key={index}>
                      <TextDefault style={styles.font} textColor={colors.headerBackground} bold H4 center>
                        {item}
                      </TextDefault>
                    </View>
                  ))}
                  {draw.specialBalls.filter(Boolean).map((item, index) => (
                    <View style={[styles.ballContainer, { backgroundColor: colors.green }]} key={index}>
                      <TextDefault style={styles.font} textColor={colors.headerBackground} bold H4 center>
                        {item}
                      </TextDefault>
                    </View>
                  ))}
                </>
              )}
            </View>
          </View>
          <Pressable onPress={handleViewAll} android_ripple={ripple} style={buttonStyle}>
            <TextDefault textColor={colors.yellow} bold>
              {"View All Results"}
            </TextDefault>
            <FontAwesome5 name="chevron-right" size={scale(12)} color={colors.yellow} />
          </Pressable>
        </View>
        <Counter
          hour={props.drawType.hour}
          minute={props.drawType.minute}
          timeZone={props.drawType.timeZone}
          latestDrawDate={props.latestDraw?.date ?? null}
        />
      </View>

      <RewardedConfirmModal
        visible={modalVisible}
        title="Out of free draw views"
        rewardLabel={`${FREE_ACTION_REWARD} more draw views`}
        busy={rewardedBusy}
        onConfirm={handleRewardedConfirm}
        onCancel={handleRewardedCancel}
      />
    </View>
  );
}

export default React.memo(MainCard);
