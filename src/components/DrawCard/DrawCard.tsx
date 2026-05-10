import { useTheme } from "@react-navigation/native";
import React from "react";
import { View } from "react-native";
import { alignment, formatDrawDateBothZones } from "../../utilities";
import { TextDefault } from "../Text";
import { useStyles } from "./styles";

function DrawCard(props: Readonly<DrawWithContext>) {
  const { colors } = useTheme() as NavigationTheme;
  const styles = useStyles();
  const dual = formatDrawDateBothZones(props.date ?? null);
  return (
    <View style={styles.drawBox}>
      <View style={styles.boxContainer}>
        <TextDefault numberOfLines={1} textColor={colors.headerText} H5 bold>
          {dual ? dual.deviceLocal : "-"}
        </TextDefault>
        {dual && !dual.matchesLondonDate && (
          <TextDefault numberOfLines={1} textColor={colors.fontSecondColor} small style={alignment.MTxSmall}>
            {`${dual.london} (Europe/London)`}
          </TextDefault>
        )}
        <View style={styles.ballRow}>
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
        </View>
      </View>
    </View>
  );
}

export default React.memo(DrawCard);
