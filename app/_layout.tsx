import type { DrawerContentComponentProps } from "@react-navigation/drawer";
import { ThemeProvider } from "@react-navigation/native";
import { Drawer } from "expo-router/drawer";
import * as SplashScreen from "expo-splash-screen";
import { SQLiteProvider } from "expo-sqlite";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import BootSplash from "../src/components/BootSplash";
import SideBar from "../src/components/SideBar/SideBar";
import { NotificationPrefsProvider } from "../src/Lib/PushNotification/NotificationProvider";
import * as NotificationService from "../src/Lib/PushNotification/NotificationService";
import AdsConsentProvider from "../src/services/ads/AdsConsentProvider";
import { startAdsBootEarly } from "../src/services/ads/bootSequence";
import { DB_NAME } from "../src/services/db/database";
import { runMigrations } from "../src/services/db/migrations";
import { backgroundRefresh, bootstrap } from "../src/services/sync/bootstrap";
import { THEME, ThemeModeProvider, useThemeMode } from "../src/theme/theme";

SplashScreen.preventAutoHideAsync().catch(() => {});

// Start the ads boot sequence at module load — as soon as the JS bundle is
// evaluated. This kicks the network-bound work (SDK init, UMP gather, App
// Open ad load) before React even mounts, shaving ~500ms-1s off the wait
// vs. firing it from inside `AppBoot`'s effect. `startAdsBootEarly()` is
// idempotent — `AdsConsentProvider` later adopts the same in-flight promise
// via `awaitAdsBootResult()`.
startAdsBootEarly().catch(() => {});

// Minimum time the custom BootSplash stays visible on cold start. On warm
// launches `bootstrap()` finishes in ~5ms — far too fast for BootSplash to
// paint — so without this hold the user would never see the branded splash.
const BOOT_SPLASH_MIN_MS = 800;

const renderDrawerContent = (props: DrawerContentComponentProps) => <SideBar {...props} />;

/**
 * Boot state machine — gates what the user sees while the app initialises.
 *
 *   boot   → BootSplash; running `bootstrap()`
 *   ready  → drawer + AdsConsentProvider (which handles UMP/ATT in the background)
 */
function AppBoot({ children }: Readonly<{ children: React.ReactNode }>) {
  const [bootState, setBootState] = useState<AppBootState>("boot");

  useEffect(() => {
    const splashStartedAt = Date.now();
    (async () => {
      try {
        await bootstrap();
      } catch (e) {
        console.warn("[AppBoot] bootstrap failed; continuing to ready:", e);
      }
      // Hold the BootSplash for at least BOOT_SPLASH_MIN_MS so users actually
      // see the branded splash, even on a fast warm launch.
      const elapsed = Date.now() - splashStartedAt;
      if (elapsed < BOOT_SPLASH_MIN_MS) {
        await new Promise((resolve) => setTimeout(resolve, BOOT_SPLASH_MIN_MS - elapsed));
      }
      setBootState("ready");
      // Defensive: ensure the native splash is gone once the Dashboard is
      // about to render. BootSplash's onLayout normally handles this, but
      // if BootSplash unmounts before its layout pass we still need the
      // splash down so the Dashboard isn't hidden underneath it.
      SplashScreen.hideAsync().catch(() => {});
      backgroundRefresh().catch(() => {});
    })();
  }, []);

  // Splash dismissal flow:
  //   - The native Expo splash is dropped by `BootSplash`'s onLayout on its
  //     first paint, so the user sees the custom branded splash briefly
  //     while `bootstrap()` runs (typically ~100-200ms on warm launch).
  //   - Once `bootstrap()` finishes, `AppBoot` flips to "ready" and the
  //     Dashboard mounts immediately via `AdsConsentProvider`. No splash
  //     gating on the ad.
  //   - The App Open ad's network load was kicked at module-load (top of
  //     this file). When LOADED fires, the ad appears on top of the
  //     Dashboard. User dismisses → back to Dashboard.

  if (bootState === "boot") return <BootSplash />;
  return <AdsConsentProvider>{children}</AdsConsentProvider>;
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
          {/* Notifications + Privacy live inside Settings — hidden from drawer. */}
          <Drawer.Screen
            name="notification"
            options={{ title: "Notifications", drawerItemStyle: { display: "none" } }}
          />
          <Drawer.Screen name="settings" options={{ title: "Settings" }} />
          <Drawer.Screen name="ballFrequency" options={{ title: "Hot & Cold" }} />
          <Drawer.Screen name="generator" options={{ title: "Number Generator" }} />
          <Drawer.Screen
            name="condition"
            options={{ title: "Terms & Conditions", drawerItemStyle: { display: "none" } }}
          />
          <Drawer.Screen name="privacy" options={{ title: "Privacy Policy", drawerItemStyle: { display: "none" } }} />
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
      <SQLiteProvider databaseName={DB_NAME} onInit={runMigrations} options={{ enableChangeListener: true }}>
        <ThemeModeProvider>
          <NotificationPrefsProvider>
            <ThemedApp />
          </NotificationPrefsProvider>
        </ThemeModeProvider>
      </SQLiteProvider>
    </GestureHandlerRootView>
  );
}
