import { FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React, { useCallback, useLayoutEffect } from 'react';
import { Pressable } from 'react-native';
import Lottery from '../src/screen/Lottery/Lottery';
import { scale } from '../src/utilities';

export default function LotteryRoute() {
  const params = useLocalSearchParams<{
    name?: string;
    gameId?: string;
    drawTypeId?: string;
    from?: string;
  }>();
  const navigation = useNavigation();
  const router = useRouter();
  const { colors } = useTheme() as NavigationTheme;

  const showBack = params.from === 'card';

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }, [router]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: params.name ?? 'Results',
      headerLeft: showBack
        ? () => (
            <Pressable
              onPress={handleBack}
              hitSlop={12}
              style={({ pressed }) => ({ paddingHorizontal: scale(12), opacity: pressed ? 0.6 : 1 })}
            >
              <FontAwesome5 name="arrow-left" size={scale(18)} color={colors.headerText} />
            </Pressable>
          )
        : undefined,
    });
  }, [navigation, params.name, handleBack, colors.headerText, showBack]);

  return <Lottery gameId={params.gameId} drawTypeId={params.drawTypeId} />;
}
