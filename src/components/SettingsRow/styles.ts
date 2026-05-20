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
        row: {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.cartContainer,
          borderRadius: scale(12),
          overflow: 'hidden',
          // Hairline border for visual separation against the page background.
          // In dark mode `cartContainer` (#19172A) sits on `mainBackground`
          // (#0F0E14) — without this border the rows blur into the background.
          borderWidth: scale(1),
          borderColor: colors.border,
          ...alignment.Pmedium,
          ...alignment.MBsmall,
        },
        rowDisabled: {
          opacity: 0.5,
        },
        pressed: {
          opacity: 0.5,
        },
        iconWrap: {
          width: scale(32),
          alignItems: 'center',
          ...alignment.MRsmall,
        },
        textWrap: {
          flex: 1,
        },
        title: {
          fontSize: scale(15),
        },
        subtitle: {
          ...alignment.MTxSmall,
        },
      }),
    [colors],
  );
};
