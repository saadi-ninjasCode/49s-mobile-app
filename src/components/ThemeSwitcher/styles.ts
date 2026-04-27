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
          ...alignment.PTsmall,
          ...alignment.PBsmall,
          paddingHorizontal: scale(16),
        },
        label: {
          opacity: 0.7,
          marginBottom: scale(8),
          letterSpacing: 0.5,
        },
        row: {
          flexDirection: 'row',
          backgroundColor: colors.drawerSelected,
          borderRadius: scale(10),
          padding: scale(3),
        },
        pill: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: scale(10),
          borderRadius: scale(8),
          backgroundColor: 'transparent',
        },
        pillActive: {
          backgroundColor: colors.fontWhite,
        },
      }),
    [colors],
  );
};
