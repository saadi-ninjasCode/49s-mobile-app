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
          justifyContent: 'center',
          ...alignment.PBlarge,
        },
        notificationContainer: {
          backgroundColor: colors.cartContainer,
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingVertical: alignment.PBlarge.paddingBottom ?? 0,
          paddingHorizontal: alignment.PRsmall.paddingRight ?? 0,
          marginVertical: alignment.MTxSmall.marginTop,
        },
        shadow: {
          shadowColor: colors.boxShadow,
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.2,
          shadowRadius: 5,
          elevation: 3,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.boxShadow,
        },
        notificationChekboxContainer: {
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
        },
        sectionHeader: {
          paddingVertical: alignment.PBsmall.paddingBottom ?? 0,
        },
      }),
    [colors],
  );
};
