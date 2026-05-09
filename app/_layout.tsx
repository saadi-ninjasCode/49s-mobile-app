import type { DrawerContentComponentProps } from "@react-navigation/drawer";
import { ThemeProvider } from "@react-navigation/native";
import { SQLiteProvider } from "expo-sqlite";
import { Drawer } from "expo-router/drawer";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { ErrorView, LoadingView } from "../src/components/ListState";
import SideBar from "../src/components/SideBar/SideBar";
import { NotificationPrefsProvider } from "../src/Lib/PushNotification/NotificationProvider";
import * as NotificationService from "../src/Lib/PushNotification/NotificationService";
import { DB_NAME } from "../src/services/db/database";
import { runMigrations } from "../src/services/db/migrations";
import { backgroundRefresh, bootstrap } from "../src/services/sync/bootstrap";
import { THEME, ThemeModeProvider, useThemeMode } from "../src/theme/theme";

const renderDrawerContent = (props: DrawerContentComponentProps) => <SideBar {...props} />;

function AppBoot({ children }: Readonly<{ children: React.ReactNode }>) {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  const run = useCallback(async () => {
    setStatus("loading");
    try {
      await bootstrap();
      setStatus("ready");
      void backgroundRefresh();
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    void run();
  }, [run]);

  if (status === "loading") return <LoadingView />;
  if (status === "error") {
    return (
      <ErrorView
        message="Couldn't load the latest results. Check your connection and try again."
        onRetry={run}
      />
    );
  }
  return <>{children}</>;
}

function ThemedApp() {
  const { scheme } = useThemeMode();
  const theme: NavigationTheme = scheme === "dark" ? THEME.Dark : THEME.Light;

  return (
    <ThemeProvider value={theme}>
      <AppBoot>
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
      </AppBoot>
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
      <SQLiteProvider databaseName={DB_NAME} onInit={runMigrations}>
        <ThemeModeProvider>
          <NotificationPrefsProvider>
            <ThemedApp />
          </NotificationPrefsProvider>
        </ThemeModeProvider>
      </SQLiteProvider>
    </GestureHandlerRootView>
  );
}
