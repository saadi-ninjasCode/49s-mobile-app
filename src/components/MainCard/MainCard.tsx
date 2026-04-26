import { FontAwesome5 } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo } from "react";
import { Pressable, View, type PressableStateCallbackType } from "react-native";
import type { DashboardEntry } from "../../types";
import { alignment, dateTransformation, getTime, scale } from "../../utilities";
import Counter from "../Counter/Counter";
import { TextDefault } from "../Text";
import { useStyles } from "./styles";

type FontAwesome5Glyph = React.ComponentProps<typeof FontAwesome5>["name"];

function MainCard(props: DashboardEntry) {
  const { colors } = useTheme() as NavigationTheme;
  const styles = useStyles();
  const router = useRouter();
  const iconName = props.lottery.icon_name as FontAwesome5Glyph;
  const lotteryId = props.lottery._id;
  const lotteryName = props.lottery.name;
  const handleViewAll = useCallback(() => {
    router.push({ pathname: "/lottery", params: { lotteryId, name: lotteryName } });
  }, [router, lotteryId, lotteryName]);
  const ripple = useMemo(() => ({ color: colors.headerBackground }), [colors.headerBackground]);
  const buttonStyle = useCallback(
    ({ pressed }: PressableStateCallbackType) => [styles.viewAllButton, pressed && styles.viewAllButtonPressed],
    [styles],
  );
  return (
    <View>
      <View style={styles.lotteryBox}>
        <View style={styles.boxHeader}>
          <TextDefault textColor={colors.headerBackground} H3 bold center>
            {props.lottery.name}
          </TextDefault>
          <FontAwesome5 name={iconName} size={scale(20)} color={colors.drawerTitleColor} />
        </View>
        <View style={styles.boxContainer}>
          <View style={styles.boxInfo}>
            <TextDefault numberOfLines={1} textColor={colors.headerText} H5 bold>
              {dateTransformation(props.draw ? props.draw.date : null, true)}
            </TextDefault>
            <TextDefault numberOfLines={1} textColor={colors.headerText} style={alignment.MTxSmall}>
              {getTime(props.draw ? props.draw.date : null)}
              <TextDefault numberOfLines={1} textColor={colors.fontSecondColor} small>
                {" (Europe/London)"}
              </TextDefault>
            </TextDefault>
            <View style={styles.lotteryBalls}>
              {props.draw &&
                (props.draw.pending ? (
                  <TextDefault textColor={colors.yellow} H4 bold>
                    {"Result Pending"}
                  </TextDefault>
                ) : (
                  <>
                    {props.draw.balls.filter(Boolean).map((item, index) => (
                      <View style={[styles.ballContainer, { backgroundColor: colors.yellow }]} key={index}>
                        <TextDefault style={styles.font} textColor={colors.headerBackground} bold H4 center>
                          {item}
                        </TextDefault>
                      </View>
                    ))}
                    {props.draw.specialBalls.filter(Boolean).map((item, index) => (
                      <View style={[styles.ballContainer, { backgroundColor: colors.green }]} key={index}>
                        <TextDefault style={styles.font} textColor={colors.headerBackground} bold H4 center>
                          {item}
                        </TextDefault>
                      </View>
                    ))}
                  </>
                ))}
            </View>
          </View>
          <Pressable onPress={handleViewAll} android_ripple={ripple} style={buttonStyle}>
            <TextDefault textColor={colors.yellow} bold>
              {"View All Results"}
            </TextDefault>
            <FontAwesome5 name="chevron-right" size={scale(12)} color={colors.yellow} />
          </Pressable>
        </View>
        <Counter time={props.lottery.next_draw} />
      </View>
    </View>
  );
}

export default React.memo(MainCard);
