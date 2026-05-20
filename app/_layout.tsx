import type { DrawerContentComponentProps } from "@react-navigation/drawer";
import { ThemeProvider } from "@react-navigation/native";
import { Drawer } from "expo-router/drawer";
import * as SplashScreen from "expo-splash-screen";
import { SQLiteProvider, useSQLiteContext } from "expo-sqlite";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import AgeGateModal from "../src/components/AgeGateModal/AgeGateModal";
import BootSplash from "../src/components/BootSplash";
import SideBar from "../src/components/SideBar/SideBar";
import UnderAgeScreen from "../src/components/UnderAgeScreen/UnderAgeScreen";
import { NotificationPrefsProvider } from "../src/Lib/PushNotification/NotificationProvider";
import * as NotificationService from "../src/Lib/PushNotification/NotificationService";
import AdsConsentProvider from "../src/services/ads/AdsConsentProvider";
import { startAdsBootEarly } from "../src/services/ads/bootSequence";
import { logAgeGateDecision } from "../src/services/analytics/events";
import {
  APP_PREF_KEYS,
  clearAgeGateDecision,
  getPrefAsBoolean,
  recordAgeGateDecision,
} from "../src/services/db/appPrefs.repo";
import { DB_NAME } from "../src/services/db/database";
import { runMigrations } from "../src/services/db/migrations";
import { backgroundRefresh, bootstrap } from "../src/services/sync/bootstrap";
import { THEME, ThemeModeProvider, useThemeMode } from "../src/theme/theme";

SplashScreen.preventAutoHideAsync().catch(() => {});

const renderDrawerContent = (props: DrawerContentComponentProps) => <SideBar {...props} />;

/**
 * Boot state machine — gates what the user sees while the app initialises.
 *
 *   boot     → BootSplash; running `bootstrap()` + reading age gate pref
 *   ageGate  → AgeGateModal; awaiting 18+ confirmation (first launch only)
 *   underAge → UnderAgeScreen; permanent dead-end if user said under 18
 *   ready    → drawer + AdsConsentProvider (which handles UMP/ATT in the background)
 */
function AppBoot({ children }: Readonly<{ children: React.ReactNode }>) {
  const db = useSQLiteContext();
  const [bootState, setBootState] = useState<AppBootState>("boot");

  useEffect(() => {
    // Kick SDK init + UMP gather + App Open preload immediately, in parallel
    // with bootstrap and the age-gate read. The ad bytes start downloading
    // while React is still mounting providers and the age-gate modal (if
    // any) is on screen. See `services/ads/bootSequence.ts`.
    startAdsBootEarly().catch(() => {});

    (async () => {
      try {
        await bootstrap();
      } catch (e) {
        console.warn("[AppBoot] bootstrap failed; continuing to gate decision:", e);
      }

      try {
        const accepted = await getPrefAsBoolean(db, APP_PREF_KEYS.ageGateAccepted);
        if (accepted === null) {
          setBootState("ageGate");
        } else if (accepted) {
          setBootState("ready");
          backgroundRefresh().catch(() => {});
        } else {
          setBootState("underAge");
        }
      } catch (e) {
        // Worst-case fall-through: show the gate rather than risk an ad-served under-18 user.
        console.warn("[AppBoot] age gate pref read failed; showing gate:", e);
        setBootState("ageGate");
      }
    })();
  }, [db]);

  // Native splash dismissal:
  //   - "boot": keep up; we're still deciding what to show.
  //   - "ageGate" / "underAge": hide now so the modal/screen becomes visible.
  //   - "ready": DO NOT hide here. `AdsConsentProvider` hides the native
  //     splash together with its JS overlay once the App Open cold-start
  //     resolves (ad shown + closed, or window expired) — eliminating any
  //     seam where the Dashboard could flash before the ad.
  useEffect(() => {
    if (bootState === "ageGate" || bootState === "underAge") {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [bootState]);

  const handleAgeDecision = useCallback(
    (accepted: boolean) => {
      logAgeGateDecision(accepted);
      recordAgeGateDecision(db, accepted).catch((e) =>
        console.warn("[AppBoot] failed to persist age gate decision:", e),
      );
      if (accepted) {
        setBootState("ready");
        backgroundRefresh().catch(() => {});
      } else {
        setBootState("underAge");
      }
    },
    [db],
  );

  const handleAgeGateRetry = useCallback(() => {
    clearAgeGateDecision(db).catch((e) => console.warn("[AppBoot] failed to clear age gate decision:", e));
    setBootState("ageGate");
  }, [db]);

  if (bootState === "boot") return <BootSplash />;
  if (bootState === "ageGate") return <AgeGateModal onDecision={handleAgeDecision} />;
  if (bootState === "underAge") return <UnderAgeScreen onRetry={handleAgeGateRetry} />;
  // "ready"
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
