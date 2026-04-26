import { useLocalSearchParams, useNavigation } from 'expo-router';
import React, { useLayoutEffect } from 'react';
import Lottery from '../src/screen/Lottery/Lottery';

export default function LotteryRoute() {
  const params = useLocalSearchParams<{ name?: string; lotteryId?: string }>();
  const navigation = useNavigation();

  useLayoutEffect(() => {
    if (params.name) {
      navigation.setOptions({ title: params.name });
    }
  }, [navigation, params.name]);

  return <Lottery lotteryId={params.lotteryId} />;
}
