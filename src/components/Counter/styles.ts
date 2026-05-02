import { useTheme } from '@react-navigation/native';
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { alignment, scale } from '../../utilities';

export const useStyles = () => {
  const { colors } = useTheme() as NavigationTheme;
  return useMemo(
    () =>
      StyleSheet.create({
        counterBox: {
          width: '100%',
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-around',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: colors.headerBackground,
          borderBottomEndRadius: scale(10),
          borderBottomStartRadius: scale(10),
          ...alignment.PxSmall,
        },
        leftSide: {
          width: '30%',
        },
        counterContainer: {
          width: '70%',
          backgroundColor: 'transparent',
          alignItems: 'center',
          justifyContent: 'space-evenly',
          flexDirection: 'row',
          ...alignment.PxSmall,
        },
        timerbox: {
          minWidth: scale(40),
          marginHorizontal: scale(2),
          paddingHorizontal: scale(4),
          paddingVertical: scale(4),
          borderRadius: scale(3),
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.drawerTitleColor,
        },
      }),
    [colors],
  );
};
