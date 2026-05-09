import { useTheme } from '@react-navigation/native';
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { scale } from '../../utilities';

export const useStyles = () => {
  const { colors } = useTheme() as NavigationTheme;
  return useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.splashBackground,
        },
        logo: {
          width: 170,
          height: 170,
        },
        spinner: {
          position: 'absolute',
          bottom: scale(80),
          alignSelf: 'center',
        },
      }),
    [colors],
  );
};
