import { useTheme } from '@react-navigation/native';
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import alignment from '../../utilities/alignment';

export const useStyles = () => {
  const { colors } = useTheme() as NavigationTheme;
  return useMemo(
    () =>
      StyleSheet.create({
        flex: { flex: 1 },
        background: {
          backgroundColor: colors.mainBackground,
          ...alignment.Pmedium,
        },
        scrollContent: {
          ...alignment.PBlarge,
        },
        sectionWrap: {
          ...alignment.MBmedium,
        },
        sectionLabel: {
          letterSpacing: 1,
          ...alignment.MBxSmall,
          ...alignment.MLxSmall,
        },
      }),
    [colors],
  );
};
