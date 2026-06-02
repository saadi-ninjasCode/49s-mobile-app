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
  const ballSize = scale(50) * fontScale;
  return useMemo(
    () =>
      StyleSheet.create({
        box: {
          ...alignment.PLlarge,
          ...alignment.PRlarge,
        },
        header: {
          width: '80%',
          minHeight: scale(32),
          backgroundColor: colors.white,
          borderWidth: scale(1),
          borderRadius: 50,
          alignSelf: 'center',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1,
          ...alignment.PTxSmall,
          ...alignment.PBxSmall,
        },
        boxContainer: {
          backgroundColor: colors.white,
          borderWidth: scale(1),
          width: '100%',
          borderRadius: scale(10),
          marginTop: -scale(16),
          alignItems: 'center',
          ...alignment.PBmedium,
          ...alignment.MBmedium,
        },
        boxInfo: {
          width: '100%',
          alignItems: 'center',
          ...alignment.MTlarge,
          ...alignment.PTlarge,
          ...alignment.PLxSmall,
          ...alignment.PRxSmall,
        },
        ballRow: {
          width: '100%',
          backgroundColor: 'transparent',
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-evenly',
        },
        ballItem: {
          justifyContent: 'center',
          alignItems: 'center',
        },
        ballContainer: {
          width: ballSize,
          height: ballSize,
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: ballSize / 2,
          overflow: 'hidden',
          ...alignment.MTxSmall,
          ...alignment.MBsmall,
        },
      }),
    [colors, ballSize],
  );
};
