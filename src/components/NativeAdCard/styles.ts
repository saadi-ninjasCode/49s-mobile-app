import { useTheme } from '@react-navigation/native';
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import alignment from '../../utilities/alignment';
import { scale } from '../../utilities/scaling';

/**
 * Visual language mirrors `src/components/MainCard/styles.ts` — same
 * `drawBox` / `boxHeader` / `boxContainer` / `boxInfo` structure so the
 * native ad blends with the surrounding dashboard cards without being
 * mistakable for one (the "Sponsored" pill in the header keeps the policy
 * attribution obvious).
 */
export const useStyles = () => {
  const { colors } = useTheme() as NavigationTheme;
  return useMemo(
    () =>
      StyleSheet.create({
        drawBox: {
          backgroundColor: 'transparent',
          width: '100%',
          ...alignment.PBsmall,
          ...alignment.PLxSmall,
          ...alignment.PRxSmall,
        },
        boxHeader: {
          width: '50%',
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
          marginTop: -scale(14),
          alignItems: 'center',
          ...alignment.PBmedium,
        },
        boxInfo: {
          width: '100%',
          alignItems: 'center',
          ...alignment.MTmedium,
          ...alignment.PTlarge,
          ...alignment.PLmedium,
          ...alignment.PRmedium,
        },
        icon: {
          width: scale(48),
          height: scale(48),
          borderRadius: scale(8),
          ...alignment.MBsmall,
        },
        headline: {
          ...alignment.MBxSmall,
        },
        advertiser: {
          ...alignment.MBsmall,
        },
        body: {
          lineHeight: scale(18),
          ...alignment.MBmedium,
        },
        ctaButton: {
          flexDirection: 'row',
          alignItems: 'center',
          alignSelf: 'center',
          gap: scale(8),
          borderWidth: scale(1),
          borderColor: colors.headerText,
          borderRadius: scale(20),
          overflow: 'hidden',
          paddingVertical: scale(6),
          paddingHorizontal: scale(14),
          ...alignment.MTsmall,
        },
      }),
    [colors],
  );
};
