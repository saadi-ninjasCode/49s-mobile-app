import { useTheme } from "@react-navigation/native";
import { useSQLiteContext } from "expo-sqlite";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, type ListRenderItem, RefreshControl, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AdBannerSlot from "../../components/AdBannerSlot/AdBannerSlot";
import DashboardDisclaimer from "../../components/DashboardDisclaimer/DashboardDisclaimer";
import { EmptyView, ErrorView, LoadingView } from "../../components/ListState";
import MainCard from "../../components/MainCard/MainCard";
import NativeAdCard from "../../components/NativeAdCard/NativeAdCard";
import { useDbChange } from "../../services/db/dbEvents";
import * as drawsRepo from "../../services/db/draws.repo";
import * as drawTypesRepo from "../../services/db/drawTypes.repo";
import * as gamesRepo from "../../services/db/games.repo";
import { refreshDashboard } from "../../services/firestore";
import { useStyles } from "./styles";

// Native ad goes at the very top of the dashboard (index 0) so it's the
// first thing the user sees above the fold. For longer dashboards we
// continue to inject one more ad every `AD_SLOT_AFTER_EVERY` real entries,
// but the top slot is the reliable one — current production dashboard has
// only 4 entries so typically just the top ad renders.
const AD_SLOT_AFTER_EVERY = 5;

const buildDashboardList = (entries: DashboardEntry[]): DashboardListItem[] => {
  const result: DashboardListItem[] = [];
  if (entries.length === 0) return result;

  let adIndex = 0;
  // Lead ad — appears as the first list item, above any real draw card.
  result.push({ kind: "ad", slotId: `ad-${adIndex++}` });

  for (let i = 0; i < entries.length; i++) {
    result.push({ kind: "entry", entry: entries[i] });
    // Subsequent ads on long lists only — skip the trailing slot so the
    // list never ends on an ad (footer takes that role).
    const consumed = i + 1;
    if (consumed % AD_SLOT_AFTER_EVERY === 0 && consumed < entries.length) {
      result.push({ kind: "ad", slotId: `ad-${adIndex++}` });
    }
  }
  return result;
};

const keyExtractor = (item: DashboardListItem): string =>
  item.kind === "entry" ? item.entry.drawType._id : item.slotId;

const renderItem: ListRenderItem<DashboardListItem> = ({ item }) =>
  item.kind === "entry" ? (
    <MainCard {...item.entry} />
  ) : (
    <NativeAdCard slotId={item.slotId} />
  );

function Main() {
  const styles = useStyles();
  const { colors } = useTheme() as NavigationTheme;
  const db = useSQLiteContext();
  const [entries, setEntries] = useState<DashboardEntry[] | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const reload = useCallback(async () => {
    try {
      const [games, drawTypes] = await Promise.all([gamesRepo.getAllGames(db), drawTypesRepo.getAllDrawTypes(db)]);
      const gamesById = new Map(games.map((g) => [g._id, g]));
      const result: DashboardEntry[] = [];
      for (const dt of drawTypes) {
        const latestDraw = await drawsRepo.getLatestDraw(db, dt._id);
        result.push({
          game: gamesById.get(dt.gameId) ?? ({} as Game),
          drawType: dt,
          latestDraw,
        });
      }
      setEntries(result);
      setError(null);
    } catch (e) {
      setError(e as Error);
    }
  }, [db]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useDbChange("draws", reload);
  useDbChange("games", reload);

  // Real-time sync: snapshot writes through to SQLite; reload runs via useDbChange.
  useEffect(() => void refreshDashboard(), []);

  const handleRetry = useCallback(() => {
    setEntries(null);
    void reload();
  }, [reload]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshDashboard();
    } finally {
      await reload();
      setRefreshing(false);
    }
  }, [reload]);

  const Separator = useCallback(() => <View style={styles.seperator} />, [styles.seperator]);

  const refreshControl = (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={handleRefresh}
      tintColor={colors.spinnerColor}
      colors={[colors.spinnerColor]}
    />
  );

  const listData = useMemo<DashboardListItem[]>(
    () => (entries ? buildDashboardList(entries) : []),
    [entries],
  );

  if (entries === null && error) {
    return (
      <SafeAreaView edges={["bottom", "left", "right"]} style={[styles.flex, styles.mainBackground]}>
        <ErrorView message="Couldn't load draws." onRetry={handleRetry} />
      </SafeAreaView>
    );
  }

  if (entries === null) {
    return (
      <SafeAreaView edges={["bottom", "left", "right"]} style={[styles.flex, styles.mainBackground]}>
        <LoadingView />
      </SafeAreaView>
    );
  }

  if (entries.length === 0) {
    return (
      <SafeAreaView edges={["bottom", "left", "right"]} style={[styles.flex, styles.mainBackground]}>
        <EmptyView message="No draws available yet." onRetry={handleRetry} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["bottom", "left", "right"]} style={[styles.flex, styles.mainBackground]}>
      <FlatList<DashboardListItem>
        data={listData}
        showsVerticalScrollIndicator={false}
        keyExtractor={keyExtractor}
        style={styles.flex}
        ItemSeparatorComponent={Separator}
        contentContainerStyle={styles.mainContainer}
        renderItem={renderItem}
        refreshControl={refreshControl}
        ListFooterComponent={DashboardDisclaimer}
      />
      {/* Sticky banner — sits outside the scrolling FlatList so it stays
          anchored to the screen bottom regardless of scroll position.
          Matches the placement pattern used on Draw / BallFrequency /
          Generator. */}
      <AdBannerSlot placement="main_footer" />
    </SafeAreaView>
  );
}

export default React.memo(Main);
