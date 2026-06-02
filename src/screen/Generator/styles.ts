import { useTheme } from '@react-navigation/native';
import { useMemo } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import { alignment, scale } from '../../utilities';

export const useStyles = () => {
  const { colors } = useTheme() as NavigationTheme;
  // Size the ball circle from the OS font scale so larger fonts never clip the
  // number — the text and the circle scale together, keeping the ratio constant
  // while reserving real layout height.
  const { fontScale } = useWindowDimensions();
  const ballSize = scale(40) * fontScale;
  return useMemo(
    () =>
      StyleSheet.create({
        flex: { flex: 1 },
        font: {
          includeFontPadding: false,
          textAlignVertical: 'center',
        },
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
          minHeight: scale(32),
          backgroundColor: colors.white,
          borderWidth: scale(1),
          borderColor: colors.headerBackground,
          borderRadius: 50,
          alignSelf: 'center',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1,
          ...alignment.PTxSmall,
          ...alignment.PBxSmall,
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
        switchRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          ...alignment.MTmedium,
        },
        ballRow: {
          width: '100%',
          backgroundColor: 'transparent',
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          ...alignment.MBmedium,
        },
        ballContainer: {
          width: ballSize,
          height: ballSize,
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: ballSize / 2,
          overflow: 'hidden',
          backgroundColor: colors.yellow,
          ...alignment.MTxSmall,
          marginHorizontal: scale(4),
        },
        boosterBallContainer: {
          width: ballSize,
          height: ballSize,
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: ballSize / 2,
          overflow: 'hidden',
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
        bannerSlot: {
          // `marginTop: 'auto'` pushes the banner to the bottom of the
          // SafeAreaView; the paddingTop is the accidental-click guard
          // between the Generate button and the banner (AdMob policy).
          marginTop: 'auto',
          ...alignment.PTlarge,
        },
      }),
    [colors, ballSize],
  );
};
