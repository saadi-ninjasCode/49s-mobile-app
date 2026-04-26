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
        logoContainer: {
          alignItems: 'center',
          backgroundColor:"rgba(255,255,255,0.1)",
          borderBottomColor: colors.sidebarDivider,
          borderBottomWidth: StyleSheet.hairlineWidth,
          paddingVertical: scale(20),
          paddingHorizontal: scale(12),
        },
        logo: {
          width: scale(64),
          height: scale(64),
          borderRadius: scale(12),
        },
        logoText: {
          ...alignment.MTsmall,
        },
      }),
    [colors],
  );
};
