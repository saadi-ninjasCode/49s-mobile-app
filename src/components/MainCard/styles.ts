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
          ...alignment.PBsmall,
          ...alignment.PLxSmall,
          ...alignment.PRxSmall,
        },
        boxHeader: {
          width: '80%',
          height: scale(32),
          backgroundColor: colors.white,
          borderWidth: scale(1),
          borderColor: colors.headerBackground,
          borderRadius: 50,
          alignSelf: 'center',
          justifyContent: 'space-evenly',
          alignItems: 'center',
          flexDirection: 'row',
          zIndex: 1,
        },
        boxContainer: {
          backgroundColor: colors.headerBackground,
          width: '100%',
          borderTopStartRadius: scale(10),
          borderTopEndRadius: scale(10),
          marginTop: -scale(16),
          alignItems: 'center',
          ...alignment.PBmedium,
        },
        boxInfo: {
          width: '100%',
          alignItems: 'center',
          ...alignment.MTlarge,
          ...alignment.PTlarge,
          ...alignment.PLxSmall,
          ...alignment.PRxSmall,
        },
        lotteryBalls: {
          width: '100%',
          backgroundColor: 'transparent',
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'center',
          ...alignment.MTlarge,
        },
        ballContainer: {
          width: scale(40),
          height: scale(40),
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 30,
          ...alignment.MRxSmall,
          ...alignment.MTxSmall,
        },
      }),
    [colors],
  );
};
