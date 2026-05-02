import { useTheme } from "@react-navigation/native";
import React from "react";
import { SectionList, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TextDefault } from "../../components/Text";
import { favouriteBall } from "../../mock/favouriteBall";
import type { BallStat } from "../../types";
import { alignment } from "../../utilities";
import { useStyles } from "./styles";

interface BallsProps {
  name: string;
  color: string;
  array: BallStat[];
}

function Balls({ name, color, array }: BallsProps) {
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

interface FavouriteSectionItem {
  hotBall: BallStat[];
  coldBall: BallStat[];
}

function FavouriteBall() {
  const { colors } = useTheme() as NavigationTheme;
  const styles = useStyles();
  const sectionData = favouriteBall.sections.map((item, index) => ({
    name: item.name,
    data: [{ hotBall: item.hotBall, coldBall: item.coldBall }] as FavouriteSectionItem[],
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

export default React.memo(FavouriteBall);
