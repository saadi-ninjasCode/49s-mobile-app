import { FontAwesome5 } from '@expo/vector-icons';
import { useFocusEffect, useTheme } from '@react-navigation/native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React, { useCallback, useLayoutEffect } from 'react';
import { BackHandler, Pressable } from 'react-native';
import Condition from '../src/screen/Condition/Condition';
import { scale } from '../src/utilities';

export default function ConditionRoute() {
  const params = useLocalSearchParams<{ from?: string }>();
  const navigation = useNavigation();
  const router = useRouter();
  const { colors } = useTheme() as NavigationTheme;

  const showBack = params.from === 'settings';

  const handleBack = useCallback(() => {
    // We only render this button when the user navigated here FROM Settings
    // (see Settings.tsx — passes `from: 'settings'`), so we know the right
    // destination unconditionally. `router.back()` is unreliable here because
    // drawer navigation via `CommonActions.navigate` doesn't push to the
    // expo-router URL history — popping would jump past Settings to the
    // initial drawer entry (Home).
    router.replace('/settings');
  }, [router]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: showBack
        ? () => (
            <Pressable
              onPress={handleBack}
              hitSlop={12}
              android_ripple={{ color: colors.drawerSelected, foreground: true, borderless: true }}
              style={({ pressed }) => ({
                paddingHorizontal: scale(12),
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <FontAwesome5 name="arrow-left" size={scale(18)} color={colors.headerText} />
            </Pressable>
          )
        : undefined,
    });
  }, [navigation, handleBack, colors.headerText, showBack]);

  // Intercept Android hardware back so the OS gesture / system bar follows
  // the same Settings-aware routing as the header arrow. `useFocusEffect`
  // adds the listener only while this screen is focused — without it the
  // listener would persist after the user leaves and hijack back from
  // unrelated screens.
  useFocusEffect(
    useCallback(() => {
      if (!showBack) return undefined;
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        handleBack();
        return true; // consume the event so the default doesn't also fire
      });
      return () => sub.remove();
    }, [showBack, handleBack]),
  );

  return <Condition />;
}
