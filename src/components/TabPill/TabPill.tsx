import { useTheme } from "@react-navigation/native";
import React, { useCallback } from "react";
import { Pressable } from "react-native";
import { TextDefault } from "../Text";
import { useStyles } from "./styles";

function TabPill({
  mode,
  active,
  disabled,
  label,
  activeColor,
  inactiveColor,
  onSelect,
}: TabPillProps) {
  const { colors } = useTheme() as NavigationTheme;
  const styles = useStyles();
  const handlePress = useCallback(() => onSelect(mode), [onSelect, mode]);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active, disabled }}
      disabled={disabled}
      onPress={handlePress}
      android_ripple={{ color: colors.drawerSelected, foreground: true }}
      style={[styles.tabPill, active && styles.tabPillActive]}
    >
      <TextDefault textColor={active ? activeColor : inactiveColor} bold center>
        {label}
      </TextDefault>
    </Pressable>
  );
}

export default React.memo(TabPill);
