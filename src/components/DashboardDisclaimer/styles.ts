import { useTheme } from '@react-navigation/native';
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { alignment, scale } from '../../utilities';

export const useStyles = () => {
  const { colors } = useTheme() as NavigationTheme;
  return useMemo(
    () =>
      StyleSheet.create({
        container: {
          ...alignment.MTmedium,
          ...alignment.Pmedium,
          borderWidth: scale(1),
          borderColor: colors.border,
          borderRadius: scale(8),
          backgroundColor: colors.card,
        },
        title: {
          ...alignment.MBsmall,
        },
        text: {
          lineHeight: scale(18),
          textAlign: 'justify',
        },
      }),
    [colors],
  );
};
