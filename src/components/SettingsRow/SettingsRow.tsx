import { FontAwesome5 } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import React from "react";
import { Pressable, View } from "react-native";
import { scale } from "../../utilities/scaling";
import { TextDefault } from "../Text";
import { useStyles } from "./styles";

type FontAwesome5Glyph = React.ComponentProps<typeof FontAwesome5>["name"];

/**
 * Tappable list row used by the Settings screen.
 *
 * Standard layout: leading icon, title (+ optional subtitle), trailing chevron.
 * Designed to match the visual rhythm of the existing drawer items + cards.
 */
function SettingsRow(props: Readonly<SettingsRowProps>) {
  const { colors } = useTheme() as NavigationTheme;
  const styles = useStyles();
  const disabled = props.disabled === true;

  return (
    <Pressable
      onPress={props.onPress}
      disabled={disabled}
      android_ripple={{ color: colors.drawerSelected, foreground: true }}
      style={({ pressed }) => [styles.row, disabled && styles.rowDisabled, pressed && !disabled && styles.pressed]}
    >
      <View style={styles.iconWrap}>
        <FontAwesome5 name={props.icon as FontAwesome5Glyph} size={scale(18)} color={colors.brandAccent} />
      </View>
      <View style={styles.textWrap}>
        <TextDefault textColor={colors.fontMainColor} style={styles.title}>
          {props.title}
        </TextDefault>
        {props.subtitle !== undefined ? (
          <TextDefault textColor={colors.fontSecondColor} small style={styles.subtitle}>
            {props.subtitle}
          </TextDefault>
        ) : null}
      </View>
      <FontAwesome5 name="chevron-right" size={scale(14)} color={colors.fontSecondColor} />
    </Pressable>
  );
}

export default React.memo(SettingsRow);
