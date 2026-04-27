import { AntDesign, FontAwesome5 } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import React from "react";
import { Pressable, View } from "react-native";
import { useThemeMode, type ThemeMode } from "../../theme/theme";
import { scale } from "../../utilities";
import { TextDefault } from "../Text";
import { useStyles } from "./styles";

interface Option {
  mode: ThemeMode;
  label: string;
  renderIcon: (size: number, color: string) => React.ReactNode;
}

const OPTIONS: readonly Option[] = [
  {
    mode: "system",
    label: "System",
    renderIcon: (size, color) => <FontAwesome5 name="mobile-alt" size={size} color={color} />,
  },
  {
    mode: "light",
    label: "Light",
    renderIcon: (size, color) => <AntDesign name="sun" size={size} color={color} />,
  },
  {
    mode: "dark",
    label: "Dark",
    renderIcon: (size, color) => <FontAwesome5 name="moon" size={size} color={color} />,
  },
];

function ThemeSwitcher() {
  const { colors } = useTheme() as NavigationTheme;
  const { mode, setMode } = useThemeMode();
  const styles = useStyles();

  return (
    <View style={styles.container}>
      <TextDefault style={styles.label} textColor={colors.fontWhite} small>
        {"Appearance"}
      </TextDefault>
      <View style={styles.row}>
        {OPTIONS.map((option) => {
          const active = option.mode === mode;
          const tint = active ? colors.drawerColor : colors.fontWhite;
          return (
            <Pressable
              key={option.mode}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`${option.label} theme`}
              onPress={() => setMode(option.mode)}
              style={[styles.pill, active && styles.pillActive]}
            >
              {option.renderIcon(scale(18), tint)}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default React.memo(ThemeSwitcher);
