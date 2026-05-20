import { useTheme } from '@react-navigation/native';
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import alignment from '../../utilities/alignment';
import { scale } from '../../utilities/scaling';

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
          ...alignment.Plarge,
        },
        card: {
          width: '100%',
          maxWidth: scale(360),
          backgroundColor: colors.cartContainer,
          borderRadius: scale(16),
          ...alignment.Plarge,
          shadowColor: colors.boxShadow,
          shadowOpacity: 0.2,
          shadowRadius: scale(8),
          shadowOffset: { width: 0, height: scale(2) },
          elevation: 4,
        },
        title: {
          ...alignment.MBmedium,
        },
        body: {
          ...alignment.MBlarge,
          lineHeight: scale(20),
        },
        primaryButton: {
          backgroundColor: colors.brandAccent,
          borderRadius: scale(12),
          overflow: 'hidden',
          ...alignment.PTmedium,
          ...alignment.PBmedium,
          ...alignment.PLlarge,
          ...alignment.PRlarge,
          ...alignment.MBsmall,
        },
        primaryButtonText: {
          fontSize: scale(14),
        },
        secondaryButton: {
          borderRadius: scale(12),
          borderWidth: scale(1),
          borderColor: colors.border,
          overflow: 'hidden',
          ...alignment.PTsmall,
          ...alignment.PBsmall,
          ...alignment.PLlarge,
          ...alignment.PRlarge,
        },
        secondaryButtonText: {
          fontSize: scale(12),
        },
        pressed: {
          opacity: 0.8,
        },
      }),
    [colors],
  );
};
