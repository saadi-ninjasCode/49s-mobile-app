import { useTheme } from "@react-navigation/native";
import { useSQLiteContext } from "expo-sqlite";
import React, { useCallback, useEffect, useState } from "react";
import { SectionList, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Balls from "../../components/Balls/Balls";
import { EmptyView, LoadingView } from "../../components/ListState";
import { TextDefault } from "../../components/Text";
import { useDbChange } from "../../services/db/dbEvents";
import * as gamesRepo from "../../services/db/games.repo";
import { alignment } from "../../utilities";
import { useStyles } from "./styles";

type BallFrequencySectionItem = {
  hotBall: BallStat[];
  coldBall: BallStat[];
};

const gamesToData = (games: Game[]): BallFrequencyData => ({
  sections: games
    .filter((g) => (g.hotBall?.length ?? 0) > 0 || (g.coldBall?.length ?? 0) > 0)
    .map((g) => ({
      gameId: g._id,
      name: g.name,
      hotBall: g.hotBall ?? [],
      coldBall: g.coldBall ?? [],
    })),
});

function BallFrequency() {
  const { colors } = useTheme() as NavigationTheme;
  const styles = useStyles();
  const db = useSQLiteContext();
  const [data, setData] = useState<BallFrequencyData | null>(null);

  const reloadFromDb = useCallback(async () => {
    const games = await gamesRepo.getAllGames(db);
    setData(gamesToData(games));
  }, [db]);

  useEffect(() => {
    void reloadFromDb();
  }, [reloadFromDb]);

  useDbChange("games", reloadFromDb);

  const handleRetry = useCallback(() => {
    void reloadFromDb();
  }, [reloadFromDb]);

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
