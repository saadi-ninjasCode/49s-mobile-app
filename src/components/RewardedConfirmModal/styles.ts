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
        backdrop: {
          flex: 1,
          backgroundColor: colors.modalBackdrop,
          alignItems: 'center',
          justifyContent: 'center',
          ...alignment.Plarge,
        },
        card: {
          width: '100%',
          maxWidth: scale(340),
          backgroundColor: colors.cartContainer,
          borderRadius: scale(16),
          ...alignment.Plarge,
        },
        title: {
          ...alignment.MBmedium,
        },
        body: {
          ...alignment.MBxSmall,
        },
        reward: {
          ...alignment.MBlarge,
          fontSize: scale(15),
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
          minHeight: scale(48),
          alignItems: 'center',
          justifyContent: 'center',
        },
        primaryButtonText: {
          fontSize: scale(15),
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
        pressed: {
          opacity: 0.85,
        },
        disabled: {
          opacity: 0.6,
        },
      }),
    [colors],
  );
};
