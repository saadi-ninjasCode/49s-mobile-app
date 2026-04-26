import { useTheme } from '@react-navigation/native';
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { alignment } from '../../utilities';

export const useStyles = () => {
  const { colors } = useTheme() as NavigationTheme;
  return useMemo(
    () =>
      StyleSheet.create({
        flex: { flex: 1 },
        mainBackground: {
          backgroundColor: colors.mainBackground,
          ...alignment.Pmedium,
        },
        scrollContent: {
          flexGrow: 1,
          alignItems: 'center',
        },
        textAlignment: {
          textAlign: 'justify',
          ...alignment.PBlarge,
        },
      }),
    [colors],
  );
};
