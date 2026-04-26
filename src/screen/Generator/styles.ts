import { useTheme } from '@react-navigation/native';
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { alignment, scale } from '../../utilities';

export const useStyles = () => {
  const { colors } = useTheme() as NavigationTheme;
  return useMemo(
    () =>
      StyleSheet.create({
        flex: { flex: 1 },
        mainBackground: {
          backgroundColor: colors.mainBackground,
          ...alignment.PLsmall,
          ...alignment.PRsmall,
        },
        box: {
          backgroundColor: 'transparent',
          width: '100%',
          ...alignment.MTlarge,
        },
        header: {
          width: '80%',
          height: scale(32),
          backgroundColor: colors.white,
          borderWidth: scale(1),
          borderColor: colors.headerBackground,
          borderRadius: 50,
          alignSelf: 'center',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1,
        },
        boxContainer: {
          backgroundColor: colors.headerBackground,
          width: '100%',
          borderRadius: scale(10),
          marginTop: -scale(16),
          alignItems: 'center',
          ...alignment.PBmedium,
        },
        boxInfo: {
          width: '100%',
          alignItems: 'center',
          ...alignment.MTlarge,
          ...alignment.PTlarge,
        },
        lotteryBalls: {
          width: '100%',
          backgroundColor: 'transparent',
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-evenly',
          ...alignment.MBmedium,
        },
        ballContainer: {
          width: scale(40),
          height: scale(40),
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: scale(20),
          backgroundColor: colors.yellow,
          ...alignment.MTxSmall,
        },
        btn: {
          ...alignment.MTlarge,
          ...alignment.Psmall,
          backgroundColor: colors.drawerTitleColor,
          paddingHorizontal: scale(24),
          borderRadius: scale(6),
        },
      }),
    [colors],
  );
};
