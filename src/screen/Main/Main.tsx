import React, { useCallback, useEffect, useState } from "react";
import { FlatList, type ListRenderItem, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  EmptyView,
  ErrorView,
  InlineErrorBanner,
  LoadingView,
} from "../../components/ListState";
import MainCard from "../../components/MainCard/MainCard";
import { subscribeDashboard } from "../../services/firestore";
import { useStyles } from "./styles";

function Separator() {
  const styles = useStyles();
  return <View style={styles.seperator} />;
}

const keyExtractor = (item: DashboardEntry) => item.drawType._id;
const renderItem: ListRenderItem<DashboardEntry> = ({ item }) => <MainCard {...item} />;

function Main() {
  const styles = useStyles();
  const [entries, setEntries] = useState<DashboardEntry[] | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    setError(null);
    return subscribeDashboard((event) => {
      if (event.type === "loading") {
        return;
      }
      if (event.type === "data") {
        setEntries(event.entries);
        setError(null);
        return;
      }
      setError(event.error);
    });
  }, [retryKey]);

  const handleRetry = useCallback(() => {
    setEntries(null);
    setRetryKey((k) => k + 1);
  }, []);

  const dismissBanner = useCallback(() => {
    setError(null);
    setRetryKey((k) => k + 1);
  }, []);

  if (entries === null && error) {
    return (
      <SafeAreaView edges={["bottom", "left", "right"]} style={[styles.flex, styles.mainBackground]}>
        <ErrorView
          message="Couldn't load draws."
          onRetry={handleRetry}
        />
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
        <EmptyView
          message="No draws available yet."
          onRetry={handleRetry}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["bottom", "left", "right"]} style={[styles.flex, styles.mainBackground]}>
      {error && <InlineErrorBanner onRetry={dismissBanner} />}
      <FlatList<DashboardEntry>
        data={entries}
        showsVerticalScrollIndicator={false}
        keyExtractor={keyExtractor}
        style={styles.flex}
        ItemSeparatorComponent={Separator}
        contentContainerStyle={styles.mainContainer}
        renderItem={renderItem}
      />
    </SafeAreaView>
  );
}

export default React.memo(Main);
