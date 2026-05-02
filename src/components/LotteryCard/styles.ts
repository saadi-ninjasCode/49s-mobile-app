import { useTheme } from '@react-navigation/native';
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { alignment, scale } from '../../utilities';

export const useStyles = () => {
  const { colors } = useTheme() as NavigationTheme;
  return useMemo(
    () =>
      StyleSheet.create({
        font: {
          ...alignment.PxSmall,
        },
        lotteryBox: {
          backgroundColor: 'transparent',
          width: '100%',
          ...alignment.PLlarge,
          ...alignment.PRlarge,
        },
        boxContainer: {
          backgroundColor: colors.headerBackground,
          width: '100%',
          borderRadius: scale(10),
          alignItems: 'center',
          paddingVertical: alignment.PBmedium.paddingBottom ?? 0,
          paddingHorizontal: alignment.PRxSmall.paddingRight ?? 0,
        },
        lotteryBalls: {
          width: '100%',
          backgroundColor: 'transparent',
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'center',
          ...alignment.MTmedium,
        },
        ballContainer: {
          width: scale(30),
          height: scale(30),
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: scale(15),
          ...alignment.MRxSmall,
          ...alignment.MTxSmall,
        },
      }),
    [colors],
  );
};
