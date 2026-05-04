import { useTheme } from '@react-navigation/native';
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { alignment, scale } from '../../utilities';

export const useStyles = () => {
  const { colors } = useTheme() as NavigationTheme;
  return useMemo(
    () =>
      StyleSheet.create({
        center: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          ...alignment.Plarge,
        },
        message: {
          ...alignment.MBmedium,
        },
        button: {
          backgroundColor: colors.brandAccent,
          paddingVertical: scale(10),
          paddingHorizontal: scale(24),
          borderRadius: scale(8),
        },
        pressed: {
          opacity: 0.7,
        },
        footer: {
          paddingVertical: scale(16),
          alignItems: 'center',
          justifyContent: 'center',
        },
      }),
    [colors],
  );
};

export const useBannerStyles = () => {
  const { colors } = useTheme() as NavigationTheme;
  return useMemo(
    () =>
      StyleSheet.create({
        banner: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: colors.notification,
          paddingVertical: scale(8),
          paddingHorizontal: scale(12),
        },
        retry: {
          paddingVertical: scale(4),
          paddingHorizontal: scale(8),
        },
        pressed: {
          opacity: 0.7,
        },
      }),
    [colors],
  );
};
