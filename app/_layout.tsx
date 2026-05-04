import type { DrawerContentComponentProps } from "@react-navigation/drawer";
import { ThemeProvider } from "@react-navigation/native";
import { Drawer } from "expo-router/drawer";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import SideBar from "../src/components/SideBar/SideBar";
import { NotificationPrefsProvider } from "../src/Lib/PushNotification/NotificationProvider";
import * as NotificationService from "../src/Lib/PushNotification/NotificationService";
import { THEME, ThemeModeProvider, useThemeMode } from "../src/theme/theme";

const renderDrawerContent = (props: DrawerContentComponentProps) => <SideBar {...props} />;

function ThemedDrawer() {
  const { scheme } = useThemeMode();
  const theme: NavigationTheme = scheme === "dark" ? THEME.Dark : THEME.Light;

  return (
    <ThemeProvider value={theme}>
      <Drawer
        drawerContent={renderDrawerContent}
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.headerBackground },
          headerTintColor: theme.colors.headerText,
          headerTitleAlign: "center",
          headerTitleStyle: { fontWeight: "bold", color: theme.colors.headerText },
          drawerStyle: { backgroundColor: theme.colors.drawerColor, width: 280 },
          drawerActiveTintColor: theme.colors.fontWhite,
          drawerInactiveTintColor: theme.colors.fontWhite,
          drawerLabelStyle: { color: theme.colors.fontWhite },
        }}
      >
        <Drawer.Screen name="index" options={{ title: "Results" }} />
        <Drawer.Screen name="draw" options={{ drawerItemStyle: { display: "none" } }} />
        <Drawer.Screen name="notification" options={{ title: "Notifications" }} />
        <Drawer.Screen name="ballFrequency" options={{ title: "Hot & Cold" }} />
        <Drawer.Screen name="generator" options={{ title: "Number Generator" }} />
        <Drawer.Screen name="condition" options={{ title: "Terms & Conditions" }} />
        <Drawer.Screen name="privacy" options={{ title: "Privacy Policy" }} />
      </Drawer>
      <StatusBar style="light" backgroundColor={theme.colors.headerBackground} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  useEffect(() => {
    NotificationService.bootstrap().catch(() => {});
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeModeProvider>
        <NotificationPrefsProvider>
          <ThemedDrawer />
        </NotificationPrefsProvider>
      </ThemeModeProvider>
    </GestureHandlerRootView>
  );
}
