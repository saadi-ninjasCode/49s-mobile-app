import { useTheme } from "@react-navigation/native";
import * as SplashScreen from "expo-splash-screen";
import React from "react";
import { ActivityIndicator, Image, View } from "react-native";
import { useStyles } from "./styles";

const LOGO = require("../../../assets/images/logo-image.png");

// Drop the native Expo splash as soon as this component paints its first frame,
// so the custom branded splash (logo + spinner) takes over. Idempotent — repeat
// calls are no-ops.
const handleLayout = () => {
  SplashScreen.hideAsync().catch(() => {});
};

function BootSplash() {
  const { colors } = useTheme() as NavigationTheme;
  const styles = useStyles();

  return (
    <View style={styles.container} onLayout={handleLayout}>
      <Image source={LOGO} style={styles.logo} resizeMode="contain" />
      <ActivityIndicator size="small" color={colors.fontWhite} style={styles.spinner} />
    </View>
  );
}

export default React.memo(BootSplash);
