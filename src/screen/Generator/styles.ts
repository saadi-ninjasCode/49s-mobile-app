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
        tabBar: {
          flexDirection: 'row',
          backgroundColor: colors.drawerSelected,
          borderRadius: scale(10),
          padding: scale(3),
          width: '90%',
          ...alignment.MBmedium,
        },
        tabPill: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: scale(10),
          borderRadius: scale(8),
          backgroundColor: 'transparent',
        },
        tabPillActive: {
          backgroundColor: colors.fontWhite,
        },
        controls: {
          width: '90%',
          ...alignment.MBmedium,
        },
        controlsLabel: {
          ...alignment.MBsmall,
        },
        countRow: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
        },
        countPill: {
          width: scale(36),
          height: scale(36),
          borderRadius: scale(18),
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: scale(1),
          borderColor: colors.fontWhite,
          backgroundColor: 'transparent',
        },
        countPillActive: {
          backgroundColor: colors.fontWhite,
        },
        switchRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          ...alignment.MTmedium,
        },
        lotteryBalls: {
          width: '100%',
          backgroundColor: 'transparent',
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
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
          marginHorizontal: scale(4),
        },
        boosterBallContainer: {
          width: scale(40),
          height: scale(40),
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: scale(20),
          backgroundColor: colors.brandAccent,
          borderWidth: scale(2),
          borderColor: colors.fontWhite,
          ...alignment.MTxSmall,
          marginHorizontal: scale(4),
        },
        boosterDivider: {
          width: scale(1),
          height: scale(28),
          backgroundColor: colors.fontWhite,
          opacity: 0.4,
          marginHorizontal: scale(6),
          ...alignment.MTxSmall,
        },
        btn: {
          ...alignment.MTlarge,
          ...alignment.Psmall,
          backgroundColor: colors.drawerTitleColor,
          paddingHorizontal: scale(24),
          borderRadius: scale(6),
          minWidth: scale(140),
          alignItems: 'center',
          justifyContent: 'center',
        },
        btnDisabled: {
          opacity: 0.6,
        },
      }),
    [colors],
  );
};
