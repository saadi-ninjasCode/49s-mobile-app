import { FontAwesome5 } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo } from "react";
import { Pressable, View, type PressableStateCallbackType } from "react-native";
import type { DashboardEntry } from "../../types";
import { alignment, dateTransformation, formatLocalDrawTime, getLocalTimeZoneAbbr, scale } from "../../utilities";
import Counter from "../Counter/Counter";
import { TextDefault } from "../Text";
import { useStyles } from "./styles";

type FontAwesome5Glyph = React.ComponentProps<typeof FontAwesome5>["name"];

function MainCard(props: Readonly<DashboardEntry>) {
  const { colors } = useTheme() as NavigationTheme;
  const styles = useStyles();
  const router = useRouter();
  const iconName = props.drawType.icon_name as FontAwesome5Glyph;
  const { gameId, drawTypeId, drawTypeName } = useMemo(
    () => ({
      gameId: props.game._id,
      drawTypeId: props.drawType._id,
      drawTypeName: props.drawType.name,
    }),
    [props.game._id, props.drawType._id, props.drawType.name],
  );
  const handleViewAll = useCallback(() => {
    router.push({
      pathname: "/draw",
      params: { gameId, drawTypeId, name: drawTypeName, from: "card" },
    });
  }, [router, gameId, drawTypeId, drawTypeName]);
  const ripple = useMemo(() => ({ color: colors.headerBackground }), [colors.headerBackground]);
  const buttonStyle = useCallback(
    ({ pressed }: PressableStateCallbackType) => [styles.viewAllButton, pressed && styles.viewAllButtonPressed],
    [styles],
  );
  const draw = props.latestDraw;
  return (
    <View>
      <View style={styles.drawBox}>
        <View style={styles.boxHeader}>
          <TextDefault textColor={colors.headerBackground} H3 bold center>
            {props.drawType.name}
          </TextDefault>
          <FontAwesome5 name={iconName} size={scale(20)} color={colors.drawerTitleColor} />
        </View>
        <View style={styles.boxContainer}>
          <View style={styles.boxInfo}>
            <TextDefault numberOfLines={1} textColor={colors.headerText} H5 bold style={alignment.MTxSmall}>
              {dateTransformation(draw ? draw.date : null, true)}
            </TextDefault>
            <TextDefault numberOfLines={1} textColor={colors.headerText} style={alignment.MTxSmall}>
              {`Next draw: ${formatLocalDrawTime(props.drawType.hour, props.drawType.minute, props.drawType.timeZone)}`}
              <TextDefault numberOfLines={1} textColor={colors.fontSecondColor} small>
                {` (${getLocalTimeZoneAbbr()})`}
              </TextDefault>
            </TextDefault>
            <TextDefault numberOfLines={1} textColor={colors.fontSecondColor} small style={alignment.MTxSmall}>
              {`${formatLocalDrawTime(props.drawType.hour, props.drawType.minute, props.drawType.timeZone, props.drawType.timeZone)} (${props.drawType.timeZone})`}
            </TextDefault>
            <View style={styles.ballRow}>
              {draw &&
                (draw.pending ? (
                  <TextDefault textColor={colors.yellow} H4 bold>
                    {"Result Pending"}
                  </TextDefault>
                ) : (
                  <>
                    {draw.balls.filter(Boolean).map((item, index) => (
                      <View style={[styles.ballContainer, { backgroundColor: colors.yellow }]} key={index}>
                        <TextDefault style={styles.font} textColor={colors.headerBackground} bold H4 center>
                          {item}
                        </TextDefault>
                      </View>
                    ))}
                    {draw.specialBalls.filter(Boolean).map((item, index) => (
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
        <Counter
          hour={props.drawType.hour}
          minute={props.drawType.minute}
          timeZone={props.drawType.timeZone}
          latestDrawDate={props.latestDraw?.date ?? null}
        />
      </View>
    </View>
  );
}

export default React.memo(MainCard);
