import { FontAwesome5 } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { useSQLiteContext } from "expo-sqlite";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { FlatList, type ListRenderItem, Pressable, RefreshControl, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DatePickerField from "../../components/DatePickerField/DatePickerField";
import DrawCard from "../../components/DrawCard/DrawCard";
import { EmptyView, ErrorView, FooterLoader, LoadingView } from "../../components/ListState";
import Separator from "../../components/Separator/Separator";
import { TextDefault } from "../../components/Text";
import { useDbChange } from "../../services/db/dbEvents";
import * as drawsRepo from "../../services/db/draws.repo";
import * as drawTypesRepo from "../../services/db/drawTypes.repo";
import * as gamesRepo from "../../services/db/games.repo";
import { refreshDrawsIfStale } from "../../services/sync/refreshDraws";
import {
  fetchDateFilter,
  loadNextPage,
  PAGE_SIZE,
} from "../../services/sync/syncDraws";
import { scale } from "../../utilities";
import { useStyles } from "./styles";

const drawKeyExtractor = (item: DrawWithContext) => item._id;

function useDrawTypeContext(drawTypeId: string | null | undefined) {
  const db = useSQLiteContext();
  const [drawType, setDrawType] = useState<DrawType | null>(null);
  const [game, setGame] = useState<Game | null>(null);

  useEffect(() => {
    if (!drawTypeId) {
      setDrawType(null);
      setGame(null);
      return;
    }
    let cancelled = false;
    (async () => {
      const dt = await drawTypesRepo.getDrawTypeById(db, drawTypeId);
      if (cancelled) return;
      setDrawType(dt);
      if (!dt) {
        setGame(null);
        return;
      }
      const g = await gamesRepo.getGameById(db, dt.gameId);
      if (!cancelled) setGame(g);
    })();
    return () => {
      cancelled = true;
    };
  }, [db, drawTypeId]);

  return { drawType, game };
}

function Draw({ drawTypeId }: Readonly<DrawProps>) {
  const { colors } = useTheme() as NavigationTheme;
  const styles = useStyles();
  const db = useSQLiteContext();

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [draws, setDraws] = useState<DrawWithContext[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const { drawType, game } = useDrawTypeContext(drawTypeId);

  const requestIdRef = useRef(0);

  // Reset state when navigating to a different drawType
  useEffect(() => {
    setSelectedDate(null);
    setVisibleCount(PAGE_SIZE);
    setDraws([]);
  }, [drawTypeId]);

  const compose = useCallback(
    (d: Draw): DrawWithContext | null => {
      if (!game || !drawType) return null;
      return { ...d, game, drawType };
    },
    [game, drawType],
  );

  // Mode 1: contiguous list (no date filter) — read from SQLite up to visibleCount
  const reloadFromDb = useCallback(async () => {
    if (!drawTypeId || !drawType || !game) return;
    const local = await drawsRepo.getContiguousDraws(db, drawTypeId, visibleCount, 0);
    const composed: DrawWithContext[] = [];
    for (const d of local) {
      const c = compose(d);
      if (c) composed.push(c);
    }
    setDraws(composed);
    const state = await drawsRepo.getPaginationState(db, drawTypeId);
    setHasMore(state?.hasMore ?? false);
  }, [db, drawTypeId, drawType, game, compose, visibleCount]);

  useEffect(() => {
    if (selectedDate || !drawTypeId || !drawType || !game) return;
    const reqId = ++requestIdRef.current;
    setLoading(true);
    setError(null);
    reloadFromDb()
      .catch((e) => {
        if (reqId === requestIdRef.current) setError(e as Error);
      })
      .finally(() => {
        if (reqId === requestIdRef.current) setLoading(false);
      });
  }, [drawTypeId, drawType, game, selectedDate, reloadFromDb]);

  // Re-render on draw inserts/tombstones — only when not in date-filter mode
  useDbChange("draws", () => {
    if (!selectedDate) void reloadFromDb();
  });

  // Mode 2: date filter — DB-first, fall back to network on miss
  useEffect(() => {
    if (!selectedDate || !drawTypeId || !drawType || !game) return;
    const reqId = ++requestIdRef.current;
    setLoading(true);
    setError(null);
    fetchDateFilter(drawTypeId, selectedDate.getTime())
      .then((draw) => {
        if (reqId !== requestIdRef.current) return;
        const composed = draw ? compose(draw) : null;
        setDraws(composed ? [composed] : []);
        setHasMore(false);
      })
      .catch((e) => {
        if (reqId !== requestIdRef.current) return;
        setError(e as Error);
        setDraws([]);
      })
      .finally(() => {
        if (reqId === requestIdRef.current) setLoading(false);
      });
  }, [selectedDate, drawTypeId, drawType, game, compose]);

  const handleRefresh = useCallback(async () => {
    if (!drawTypeId) return;
    const reqId = ++requestIdRef.current;
    setRefreshing(true);
    setError(null);
    try {
      if (selectedDate) {
        const draw = await fetchDateFilter(drawTypeId, selectedDate.getTime());
        if (reqId !== requestIdRef.current) return;
        const composed = draw ? compose(draw) : null;
        setDraws(composed ? [composed] : []);
      } else {
        await refreshDrawsIfStale(drawTypeId);
        if (reqId !== requestIdRef.current) return;
        // useDbChange triggers reloadFromDb on inserts/tombstones; visibleCount
        // grows organically as the user scrolls (loadNextPage).
      }
    } catch (e) {
      if (reqId !== requestIdRef.current) return;
      setError(e as Error);
    } finally {
      if (reqId === requestIdRef.current) setRefreshing(false);
    }
  }, [drawTypeId, selectedDate, compose]);

  const handleLoadMore = useCallback(async () => {
    if (loadingMore || !hasMore || !drawTypeId || selectedDate) return;
    const reqId = ++requestIdRef.current;
    setLoadingMore(true);
    try {
      const result = await loadNextPage(drawTypeId, PAGE_SIZE);
      if (reqId !== requestIdRef.current) return;
      if (result.count > 0) setVisibleCount((prev) => prev + result.count);
      setHasMore(result.hasMore);
    } catch {
      // pagination errors stay silent — user keeps existing list, can retry by scrolling again
    } finally {
      if (reqId === requestIdRef.current) setLoadingMore(false);
    }
  }, [loadingMore, hasMore, drawTypeId, selectedDate]);

  const handleClear = useCallback(() => setSelectedDate(null), []);

  const clearButtonStyle = useCallback(
    ({ pressed }: { pressed: boolean }) => [
      styles.clearButton,
      pressed && styles.clearButtonPressed,
    ],
    [styles.clearButton, styles.clearButtonPressed],
  );

  const isFiltering = selectedDate !== null;

  const filterRow = (
    <View style={styles.filterRow}>
      <DatePickerField
        value={selectedDate}
        onSelect={setSelectedDate}
        placeholder="Filter by date"
        maximumDate={new Date()}
      />
      {isFiltering && (
        <Pressable onPress={handleClear} style={clearButtonStyle}>
          <FontAwesome5 name="times" size={scale(12)} color={colors.brandAccent} />
          <TextDefault textColor={colors.brandAccent} bold>
            {"Clear"}
          </TextDefault>
        </Pressable>
      )}
    </View>
  );

  const renderItem = useCallback<ListRenderItem<DrawWithContext>>(
    ({ item, index }) => {
      const headers = [];
      if (index === 0 && draws.length === 1) {
        headers.push(
          <TextDefault key={"title"} textColor={colors.brandAccent} H4 center style={styles.headerStyles}>
            {"Results"}
          </TextDefault>,
        );
      } else if (index === 0 && draws.length > 1) {
        headers.push(
          <TextDefault key={"latest_title"} textColor={colors.brandAccent} H4 center style={styles.headerStyles}>
            {"Latest Result"}
          </TextDefault>,
        );
      } else if (index === 1 && draws.length > 2) {
        headers.push(
          <TextDefault key={"prev_title"} textColor={colors.brandAccent} H4 center style={styles.headerStyles}>
            {"Previous Results"}
          </TextDefault>,
        );
      }
      return (
        <>
          {headers}
          <DrawCard {...item} />
        </>
      );
    },
    [draws.length, colors.brandAccent, styles.headerStyles],
  );

  const refreshControl = (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={handleRefresh}
      tintColor={colors.spinnerColor}
      colors={[colors.spinnerColor]}
    />
  );

  if (loading && draws.length === 0) {
    return (
      <SafeAreaView edges={["bottom", "left", "right"]} style={styles.flex}>
        <LoadingView />
      </SafeAreaView>
    );
  }

  if (error && draws.length === 0) {
    return (
      <SafeAreaView edges={["bottom", "left", "right"]} style={styles.flex}>
        <ErrorView message="Couldn't load draws." onRetry={handleRefresh} />
      </SafeAreaView>
    );
  }

  if (!loading && draws.length === 0) {
    return (
      <SafeAreaView edges={["bottom", "left", "right"]} style={styles.flex}>
        {filterRow}
        <EmptyView
          message={isFiltering ? "No draw result found" : "Data is not available now."}
          onRetry={handleRefresh}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["bottom", "left", "right"]} style={styles.flex}>
      <FlatList<DrawWithContext>
        data={draws}
        showsVerticalScrollIndicator={false}
        keyExtractor={drawKeyExtractor}
        style={styles.flex}
        ListHeaderComponent={filterRow}
        ItemSeparatorComponent={Separator}
        contentContainerStyle={[styles.mainBackground, styles.mainContainer]}
        renderItem={renderItem}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loadingMore ? FooterLoader : null}
        refreshControl={refreshControl}
      />
    </SafeAreaView>
  );
}

export default React.memo(Draw);
