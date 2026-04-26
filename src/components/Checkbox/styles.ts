import { useTheme } from '@react-navigation/native';
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { scale } from '../../utilities';

export const useStyles = () => {
  const { colors } = useTheme() as NavigationTheme;
  return useMemo(
    () =>
      StyleSheet.create({
        mainContainer: {
          borderColor: colors.boxShadow,
          borderWidth: StyleSheet.hairlineWidth,
          width: scale(20),
          height: scale(20),
          justifyContent: 'center',
          alignItems: 'center',
        },
      }),
    [colors],
  );
};
