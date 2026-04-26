import { useTheme } from '@react-navigation/native';
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { alignment, scale } from '../../../utilities';

export const useStyles = () => {
  const { colors } = useTheme() as NavigationTheme;
  return useMemo(
    () =>
      StyleSheet.create({
        mainContainer: {
          flex: 1,
          backgroundColor: 'transparent',
        },
        loginContainer: {
          flex: 1,
          justifyContent: 'flex-end',
        },
        subConainer: {
          flex: 1,
          justifyContent: 'space-between',
        },
        imgContainer: {
          width: scale(70),
          height: scale(70),
          borderRadius: scale(35),
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.drawerTitleColor,
          ...alignment.MTlarge,
        },
        touchSpace: {
          width: '100%',
          ...alignment.PTlarge,
          ...alignment.PBmedium,
        },
        font: {
          fontWeight: '700',
        },
      }),
    [colors],
  );
};
