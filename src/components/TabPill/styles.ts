import { useTheme } from '@react-navigation/native';
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { scale } from '../../utilities';

export const useStyles = () => {
  const { colors } = useTheme() as NavigationTheme;
  return useMemo(
    () =>
      StyleSheet.create({
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
      }),
    [colors],
  );
};
