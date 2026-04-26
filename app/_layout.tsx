import type { DrawerContentComponentProps } from '@react-navigation/drawer';
import { ThemeProvider } from '@react-navigation/native';
import { Drawer } from 'expo-router/drawer';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import SideBar from '../src/components/SideBar/SideBar';
import { THEME } from '../src/theme/theme';

const renderDrawerContent = (props: DrawerContentComponentProps) => <SideBar {...props} />;

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme: NavigationTheme = colorScheme === 'dark' ? THEME.Dark : THEME.Light;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={theme}>
        <Drawer
          drawerContent={renderDrawerContent}
          screenOptions={{
            headerStyle: { backgroundColor: theme.colors.headerBackground },
            headerTintColor: theme.colors.headerText,
            headerTitleStyle: { fontWeight: 'bold', color: theme.colors.headerText },
            drawerStyle: { backgroundColor: theme.colors.drawerColor, width: 280 },
            drawerActiveTintColor: theme.colors.fontWhite,
            drawerInactiveTintColor: theme.colors.fontWhite,
            drawerLabelStyle: { color: theme.colors.fontWhite },
          }}>
          <Drawer.Screen name="index" options={{ title: 'Lottery' }} />
          <Drawer.Screen name="lottery" options={{ title: 'Lottery' }} />
          <Drawer.Screen name="profile" options={{ title: 'Profile' }} />
          <Drawer.Screen name="notification" options={{ title: 'Notifications' }} />
          <Drawer.Screen name="favourite" options={{ title: 'Hot & Cold' }} />
          <Drawer.Screen name="generator" options={{ title: 'Number Generator' }} />
          <Drawer.Screen name="condition" options={{ title: 'Terms & Conditions' }} />
          <Drawer.Screen name="privacy" options={{ title: 'Privacy Policy' }} />
        </Drawer>
        <StatusBar style="light" backgroundColor={theme.colors.headerBackground} />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
