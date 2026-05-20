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
        logo: {
          width: scale(120),
          height: scale(120),
          ...alignment.MBlarge,
        },
        icon: {
          ...alignment.MBmedium,
        },
        title: {
          ...alignment.MBmedium,
        },
        body: {
          maxWidth: scale(320),
          lineHeight: scale(20),
          ...alignment.MBlarge,
        },
        retryButton: {
          backgroundColor: colors.brandAccent,
          borderRadius: scale(12),
          overflow: 'hidden',
          ...alignment.PTmedium,
          ...alignment.PBmedium,
          ...alignment.PLlarge,
          ...alignment.PRlarge,
        },
        retryButtonText: {
          fontSize: scale(14),
        },
        pressed: {
          opacity: 0.8,
        },
      }),
    [colors],
  );
};
