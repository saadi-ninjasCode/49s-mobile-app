import React, { useCallback } from "react";
import { Pressable } from "react-native";
import { TextDefault } from "../Text";
import { useStyles } from "./styles";

function CountPill({
  value,
  active,
  disabled,
  activeColor,
  inactiveColor,
  onSelect,
}: CountPillProps) {
  const styles = useStyles();
  const handlePress = useCallback(() => onSelect(value), [onSelect, value]);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active, disabled }}
      disabled={disabled}
      onPress={handlePress}
      style={[styles.countPill, active && styles.countPillActive]}
    >
      <TextDefault textColor={active ? activeColor : inactiveColor} bold>
        {value}
      </TextDefault>
    </Pressable>
  );
}

export default React.memo(CountPill);
