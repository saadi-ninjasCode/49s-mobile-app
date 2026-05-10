import { useTheme } from "@react-navigation/native";
import { useSQLiteContext } from "expo-sqlite";
import React, { useCallback, useEffect, useState } from "react";
import { FlatList, type ListRenderItem, RefreshControl, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyView, ErrorView, LoadingView } from "../../components/ListState";
import MainCard from "../../components/MainCard/MainCard";
import { useDbChange } from "../../services/db/dbEvents";
import * as drawsRepo from "../../services/db/draws.repo";
import * as drawTypesRepo from "../../services/db/drawTypes.repo";
import * as gamesRepo from "../../services/db/games.repo";
import { refreshDashboard } from "../../services/firestore";
import { useStyles } from "./styles";

const keyExtractor = (item: DashboardEntry) => item.drawType._id;
const renderItem: ListRenderItem<DashboardEntry> = ({ item }) => <MainCard {...item} />;

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

  const Separator = useCallback(() => <View style={styles.seperator} />, []);

  const refreshControl = (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={handleRefresh}
      tintColor={colors.spinnerColor}
      colors={[colors.spinnerColor]}
    />
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
      <FlatList<DashboardEntry>
        data={entries}
        showsVerticalScrollIndicator={false}
        keyExtractor={keyExtractor}
        style={styles.flex}
        ItemSeparatorComponent={Separator}
        contentContainerStyle={styles.mainContainer}
        renderItem={renderItem}
        refreshControl={refreshControl}
      />
    </SafeAreaView>
  );
}

export default React.memo(Main);
