import { useTheme } from "@react-navigation/native";
import React from "react";
import { ActivityIndicator, Image, View } from "react-native";
import { useStyles } from "./styles";

const LOGO = require("../../../assets/images/logo-image.png");

function BootSplash() {
  const { colors } = useTheme() as NavigationTheme;
  const styles = useStyles();

  return (
    <View style={styles.container}>
      <Image source={LOGO} style={styles.logo} resizeMode="contain" />
      <ActivityIndicator size="small" color={colors.fontWhite} style={styles.spinner} />
    </View>
  );
}

export default React.memo(BootSplash);
