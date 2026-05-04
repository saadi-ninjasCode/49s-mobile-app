import { FontAwesome5 } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { FlatList, type ListRenderItem, Pressable, RefreshControl, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DatePickerField from "../../components/DatePickerField/DatePickerField";
import DrawCard from "../../components/DrawCard/DrawCard";
import { EmptyView, ErrorView, FooterLoader, LoadingView } from "../../components/ListState";
import { TextDefault } from "../../components/Text";
import { type DrawsPageCursor, fetchDrawsPage } from "../../services/firestore";
import { scale } from "../../utilities";
import { useStyles } from "./styles";

export interface DrawProps {
  gameId?: string | null;
  drawTypeId?: string | null;
}

const PAGE_SIZE = 20;

const drawKeyExtractor = (item: DrawWithContext) => item._id;

function Separator() {
  const styles = useStyles();
  return <View style={styles.separator} />;
}

function Draw({ drawTypeId }: Readonly<DrawProps>) {
  const { colors } = useTheme() as NavigationTheme;
  const styles = useStyles();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [draws, setDraws] = useState<DrawWithContext[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const lastDocRef = useRef<DrawsPageCursor | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    setSelectedDate(null);
  }, [drawTypeId]);

  const loadFirstPage = useCallback(async () => {
    if (!drawTypeId) {
      setDraws([]);
      setLoading(false);
      setError(null);
      setHasMore(false);
      lastDocRef.current = null;
      return;
    }
    const reqId = ++requestIdRef.current;
    setLoading(true);
    setError(null);
    try {
      const page = await fetchDrawsPage(drawTypeId, {
        pageSize: PAGE_SIZE,
        date: selectedDate,
      });
      if (reqId !== requestIdRef.current) return;
      setDraws(page.draws);
      lastDocRef.current = page.lastDoc;
      setHasMore(page.hasMore);
    } catch (e) {
      if (reqId !== requestIdRef.current) return;
      setError(e as Error);
      setDraws([]);
      lastDocRef.current = null;
      setHasMore(false);
    } finally {
      if (reqId === requestIdRef.current) setLoading(false);
    }
  }, [drawTypeId, selectedDate]);

  useEffect(() => {
    void loadFirstPage();
  }, [loadFirstPage]);

  const handleRefresh = useCallback(async () => {
    if (!drawTypeId) return;
    const reqId = ++requestIdRef.current;
    setRefreshing(true);
    setError(null);
    try {
      const page = await fetchDrawsPage(drawTypeId, {
        pageSize: PAGE_SIZE,
        date: selectedDate,
      });
      if (reqId !== requestIdRef.current) return;
      setDraws(page.draws);
      lastDocRef.current = page.lastDoc;
      setHasMore(page.hasMore);
    } catch (e) {
      if (reqId !== requestIdRef.current) return;
      setError(e as Error);
    } finally {
      if (reqId === requestIdRef.current) setRefreshing(false);
    }
  }, [drawTypeId, selectedDate]);

  const handleLoadMore = useCallback(async () => {
    if (loadingMore || !hasMore || !drawTypeId || !lastDocRef.current || selectedDate) return;
    const reqId = ++requestIdRef.current;
    setLoadingMore(true);
    try {
      const page = await fetchDrawsPage(drawTypeId, {
        pageSize: PAGE_SIZE,
        after: lastDocRef.current,
      });
      if (reqId !== requestIdRef.current) return;
      setDraws((prev) => [...prev, ...page.draws]);
      lastDocRef.current = page.lastDoc;
      setHasMore(page.hasMore);
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
        <ErrorView message="Couldn't load draws." onRetry={loadFirstPage} />
      </SafeAreaView>
    );
  }

  if (!loading && draws.length === 0) {
    return (
      <SafeAreaView edges={["bottom", "left", "right"]} style={styles.flex}>
        {filterRow}
        <EmptyView
          message={isFiltering ? "No draw result found" : "Data is not available now."}
          onRetry={loadFirstPage}
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
