import { useTheme } from '@react-navigation/native';
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { alignment, scale } from '../../utilities';

export const useStyles = () => {
  const { colors } = useTheme() as NavigationTheme;
  return useMemo(
    () =>
      StyleSheet.create({
        flex: { flex: 1 },
        mainBackground: { backgroundColor: colors.mainBackground },
        mainContainer: {
          flexGrow: 1,
          backgroundColor: 'transparent',
          ...alignment.PTlarge,
          ...alignment.PBlarge,
        },
        separator: { ...alignment.MTmedium },
        headerStyles: {
          ...alignment.MBmedium,
        },
        filterRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: scale(8),
          ...alignment.PLsmall,
          ...alignment.PRsmall,
          ...alignment.PTsmall,
          ...alignment.PBsmall,
        },
        clearButton: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: scale(6),
          borderWidth: scale(1),
          borderColor: colors.brandAccent,
          borderRadius: scale(8),
          paddingVertical: scale(10),
          paddingHorizontal: scale(12),
        },
        clearButtonPressed: {
          opacity: 0.6,
        },
        emptyState: {
          ...alignment.PTlarge,
          ...alignment.PBlarge,
          alignItems: 'center',
        },
      }),
    [colors],
  );
};
