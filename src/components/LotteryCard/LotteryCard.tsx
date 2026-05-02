import { useTheme } from "@react-navigation/native";
import React from "react";
import { View } from "react-native";
import type { DrawWithContext } from "../../types";
import { dateTransformation, getZone } from "../../utilities";
import { TextDefault } from "../Text";
import { useStyles } from "./styles";

function LotteryCard(props: Readonly<DrawWithContext>) {
  const { colors } = useTheme() as NavigationTheme;
  const styles = useStyles();
  return (
    <View style={styles.lotteryBox}>
      <View style={styles.boxContainer}>
        <TextDefault numberOfLines={1} textColor={colors.headerText} H5 bold>
          {dateTransformation(props.date ?? null, true)}
        </TextDefault>
        <TextDefault small numberOfLines={1} textColor={colors.fontSecondColor}>
          {getZone(props.date ?? null)}
        </TextDefault>
        <View style={styles.lotteryBalls}>
          {props.pending ? (
            <TextDefault textColor={colors.yellow} H4 bold>
              {"Result Pending"}
            </TextDefault>
          ) : (
            <>
              {props.balls.filter(Boolean).map((item, index) => (
                <View style={[styles.ballContainer, { backgroundColor: colors.yellow }]} key={index}>
                  <TextDefault style={styles.font} textColor={colors.headerBackground} bold H4 center>
                    {item}
                  </TextDefault>
                </View>
              ))}
              {props.specialBalls.filter(Boolean).map((item, index) => (
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
    </View>
  );
}

export default React.memo(LotteryCard);
