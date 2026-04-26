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
        mainBackground: { backgroundColor: colors.mainBackground },
        mainContainer: {
          flexGrow: 1,
          backgroundColor: 'transparent',
          ...alignment.PTlarge,
          ...alignment.PBlarge,
        },
        seperator: { ...alignment.MTmedium },
        headerStyles: {
          backgroundColor: colors.headerBackground,
          ...alignment.MBmedium,
          ...alignment.PTxSmall,
          ...alignment.PBxSmall,
        },
      }),
    [colors],
  );
};
