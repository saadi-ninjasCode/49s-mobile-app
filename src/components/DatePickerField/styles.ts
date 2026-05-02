import { useTheme } from '@react-navigation/native';
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { alignment, scale } from '../../utilities';

export const useStyles = () => {
  const { colors } = useTheme() as NavigationTheme;
  return useMemo(
    () =>
      StyleSheet.create({
        field: {
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: colors.cartContainer,
          borderWidth: scale(1),
          borderColor: colors.border,
          borderRadius: scale(8),
          paddingVertical: scale(10),
          paddingHorizontal: scale(12),
          gap: scale(8),
        },
        fieldText: {
          flex: 1,
        },
        modalBackdrop: {
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          justifyContent: 'flex-end',
        },
        modalSheet: {
          backgroundColor: colors.cartContainer,
          borderTopLeftRadius: scale(16),
          borderTopRightRadius: scale(16),
          paddingBottom: scale(16),
        },
        spinnerWrapper: {
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center',
        },
        modalHeader: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
          paddingHorizontal: scale(16),
          paddingVertical: scale(12),
        },
        modalButton: {
          ...alignment.Psmall,
        },
        modalButtonPressed: {
          opacity: 0.6,
        },
      }),
    [colors],
  );
};
