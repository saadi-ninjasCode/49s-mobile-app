import { useTheme } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import { SectionList, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyView, ErrorView, LoadingView } from "../../components/ListState";
import { TextDefault } from "../../components/Text";
import { fetchBallFrequency } from "../../services/firestore";
import { alignment } from "../../utilities";
import { useStyles } from "./styles";

interface BallsProps {
  name: string;
  color: string;
  array: BallStat[];
}

function Balls({ name, color, array }: Readonly<BallsProps>) {
  const { colors } = useTheme() as NavigationTheme;
  const styles = useStyles();
  return (
    <View style={styles.box}>
      <View style={[styles.header, { borderColor: color }]}>
        <TextDefault textColor={color} H4 bold center>
          {name}
        </TextDefault>
      </View>
      <View style={styles.boxContainer}>
        <View style={styles.boxInfo}>
          <View style={styles.ballRow}>
            {array.map((objBall, i) => (
              <View style={{ justifyContent: "center", alignItems: "center" }} key={i}>
                <View style={[styles.ballContainer, { backgroundColor: color }]}>
                  <TextDefault textColor={colors.fontWhite} bold H3 center>
                    {objBall.ball}
                  </TextDefault>
                </View>
                <TextDefault textColor={colors.facebook} bold H4>
                  {objBall.times}
                  {" times"}
                </TextDefault>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

interface BallFrequencySectionItem {
  hotBall: BallStat[];
  coldBall: BallStat[];
}

function BallFrequency() {
  const { colors } = useTheme() as NavigationTheme;
  const styles = useStyles();
  const [data, setData] = useState<BallFrequencyData | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    fetchBallFrequency()
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((e) => {
        if (!cancelled) setError(e as Error);
      });
    return () => {
      cancelled = true;
    };
  }, [retryKey]);

  const handleRetry = useCallback(() => {
    setData(null);
    setRetryKey((k) => k + 1);
  }, []);

  if (data === null && error) {
    return (
      <SafeAreaView edges={["bottom", "left", "right"]} style={[styles.flex, styles.mainBackground]}>
        <ErrorView message="Couldn't load stats." onRetry={handleRetry} />
      </SafeAreaView>
    );
  }

  if (data === null) {
    return (
      <SafeAreaView edges={["bottom", "left", "right"]} style={[styles.flex, styles.mainBackground]}>
        <LoadingView />
      </SafeAreaView>
    );
  }

  if (data.sections.length === 0) {
    return (
      <SafeAreaView edges={["bottom", "left", "right"]} style={[styles.flex, styles.mainBackground]}>
        <EmptyView message="No stats available yet." onRetry={handleRetry} />
      </SafeAreaView>
    );
  }

  const sectionData = data.sections.map((item, index) => ({
    name: item.name,
    data: [{ hotBall: item.hotBall, coldBall: item.coldBall }] as BallFrequencySectionItem[],
    index,
  }));

  return (
    <SafeAreaView edges={["bottom", "left", "right"]} style={[styles.flex, styles.mainBackground]}>
      <SectionList
        style={{ flexGrow: 1 }}
        contentContainerStyle={alignment.PTmedium}
        sections={sectionData}
        keyExtractor={(_, index) => String(index)}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <TextDefault textColor={colors.fontWhite} H3 bold center>
              {section.name}
            </TextDefault>
          </View>
        )}
        renderItem={({ item }) => (
          <>
            <Balls name="Cold Balls" color={colors.facebook} array={item.coldBall} />
            <Balls name="Hot Balls" color={colors.google} array={item.hotBall} />
          </>
        )}
      />
    </SafeAreaView>
  );
}

export default React.memo(BallFrequency);
