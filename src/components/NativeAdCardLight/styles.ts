import { useTheme } from '@react-navigation/native';
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import alignment from '../../utilities/alignment';
import { scale } from '../../utilities/scaling';

export const useStyles = () => {
  const { colors } = useTheme() as NavigationTheme;
  return useMemo(
    () =>
      StyleSheet.create({
        drawBox: {
          backgroundColor: 'transparent',
          width: '100%',
          ...alignment.PLlarge,
          ...alignment.PRlarge,
          ...alignment.MTmedium,
          ...alignment.MBmedium,
        },
        boxContainer: {
          backgroundColor: colors.white,
          borderWidth: scale(1),
          borderColor: colors.facebook,
          width: '100%',
          borderRadius: scale(10),
          ...alignment.PTmedium,
          ...alignment.PBmedium,
          ...alignment.PLmedium,
          ...alignment.PRmedium,
        },
        sponsoredPill: {
          alignSelf: 'flex-start',
          backgroundColor: colors.facebook,
          borderRadius: scale(6),
          paddingVertical: scale(2),
          paddingHorizontal: scale(8),
          ...alignment.MBsmall,
        },
        row: {
          flexDirection: 'row',
          alignItems: 'center',
          ...alignment.MBsmall,
        },
        icon: {
          width: scale(40),
          height: scale(40),
          borderRadius: scale(6),
          ...alignment.MRsmall,
        },
        textColumn: {
          flex: 1,
        },
        headline: {
          ...alignment.MBxSmall,
        },
        body: {
          lineHeight: scale(18),
          ...alignment.MBsmall,
        },
        ctaButton: {
          flexDirection: 'row',
          alignItems: 'center',
          alignSelf: 'flex-start',
          gap: scale(8),
          backgroundColor: colors.facebook,
          borderRadius: scale(20),
          overflow: 'hidden',
          paddingVertical: scale(6),
          paddingHorizontal: scale(14),
          ...alignment.MTxSmall,
        },
      }),
    [colors],
  );
};
