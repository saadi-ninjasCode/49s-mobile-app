import { Drawer } from 'expo-router/drawer';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import type { DrawerContentComponentProps } from '@react-navigation/drawer';
import SideBar from '../src/components/SideBar/SideBar';
import { colors } from '../src/utilities';

const renderDrawerContent = (props: DrawerContentComponentProps) => <SideBar {...props} />;

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={renderDrawerContent}
        screenOptions={{
          headerStyle: { backgroundColor: colors.headerBackground },
          headerTintColor: colors.headerText,
          headerTitleStyle: { fontWeight: 'bold' },
          drawerStyle: { backgroundColor: colors.drawerColor, width: 280 },
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
      <StatusBar style="light" backgroundColor={colors.headerBackground} />
    </GestureHandlerRootView>
  );
}
