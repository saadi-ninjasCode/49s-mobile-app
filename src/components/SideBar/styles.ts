import { useTheme } from '@react-navigation/native';
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { alignment, scale } from '../../utilities';

export const useStyles = () => {
  const { colors } = useTheme() as NavigationTheme;
  return useMemo(
    () =>
      StyleSheet.create({
        scrollContent: {
          flexGrow: 1,
          backgroundColor: colors.drawerColor,
        },
        flexBg: {
          flex: 1,
          backgroundColor: 'transparent',
        },
        transparent: {
          backgroundColor: 'transparent',
        },
        font: {
          fontWeight: '400',
          ...alignment.PLmedium,
        },
        headerContainer: {
          justifyContent: 'center',
          height: scale(200),
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.sidebarDivider,
          backgroundColor: colors.drawerHeader,
          ...alignment.Pmedium,
        },
        menuContainer: {
          backgroundColor: 'transparent',
          justifyContent: 'space-between',
          ...alignment.PTxSmall,
        },
        bottomMenu: {
          borderTopColor: colors.sidebarDivider,
          borderTopWidth: StyleSheet.hairlineWidth,
          ...alignment.MTsmall,
        },
        line: {
          ...alignment.MTxSmall,
          ...alignment.MBxSmall,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.sidebarDivider,
        },
        resultContainer: {
          ...alignment.PLlarge,
        },
      }),
    [colors],
  );
};
