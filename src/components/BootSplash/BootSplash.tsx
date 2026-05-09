import { useTheme } from "@react-navigation/native";
import * as SplashScreen from "expo-splash-screen";
import React, { useCallback } from "react";
import { ActivityIndicator, Image, View } from "react-native";
import { useStyles } from "./styles";

const LOGO = require("../../../assets/images/logo-image.png");

function BootSplash() {
  const { colors } = useTheme() as NavigationTheme;
  const styles = useStyles();
  const onLayout = useCallback(() => {
    setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {});
    }, 200);
  }, []);

  return (
    <View style={styles.container} onLayout={onLayout}>
      <Image source={LOGO} style={styles.logo} resizeMode="contain" />
      <ActivityIndicator size="small" color={colors.fontWhite} style={styles.spinner} />
    </View>
  );
}

export default React.memo(BootSplash);
