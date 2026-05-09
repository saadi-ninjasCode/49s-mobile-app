import { useTheme } from '@react-navigation/native';
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { scale } from '../../utilities';

export const useStyles = () => {
  const { colors } = useTheme() as NavigationTheme;
  return useMemo(
    () =>
      StyleSheet.create({
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
      }),
    [colors],
  );
};
