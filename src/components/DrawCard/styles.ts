import { useTheme } from '@react-navigation/native';
import { useMemo } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import { alignment, scale } from '../../utilities';

export const useStyles = () => {
  const { colors } = useTheme() as NavigationTheme;
  // Grow the ball circle with the OS font scale so larger fonts never clip the
  // number — the text and the circle scale together, keeping the ratio constant
  // while reserving real layout height (an aspectRatio-only box does not).
  const { fontScale } = useWindowDimensions();
  const ballSize = scale(30) * fontScale;
  return useMemo(
    () =>
      StyleSheet.create({
        font: {
          includeFontPadding: false,
          textAlignVertical: 'center',
        },
        drawBox: {
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
        ballRow: {
          width: '100%',
          backgroundColor: 'transparent',
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'center',
          ...alignment.MTmedium,
        },
        ballContainer: {
          width: ballSize,
          height: ballSize,
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: ballSize / 2,
          overflow: 'hidden',
          ...alignment.MRxSmall,
          ...alignment.MTxSmall,
        },
      }),
    [colors, ballSize],
  );
};
