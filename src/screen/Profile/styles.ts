import { useTheme } from '@react-navigation/native';
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { alignment, scale, verticalScale } from '../../utilities';

export const useStyles = () => {
  const { colors } = useTheme() as NavigationTheme;
  return useMemo(
    () =>
      StyleSheet.create({
        flex: { flex: 1 },
        backScreen: {
          backgroundColor: colors.mainBackground,
          justifyContent: 'center',
          alignItems: 'center',
        },
        formSubContainer: {
          width: '90%',
          backgroundColor: colors.cartContainer,
          alignSelf: 'center',
          shadowOffset: { width: 2, height: 4 },
          shadowColor: colors.boxShadow,
          shadowOpacity: 0.4,
          shadowRadius: 10,
          elevation: 6,
          borderRadius: scale(8),
          ...alignment.MBlarge,
          ...alignment.MTlarge,
          ...alignment.Pmedium,
        },
        containerInfo: {
          width: '100%',
          ...alignment.MTsmall,
          ...alignment.PLsmall,
        },
        containerHeading: {
          flexDirection: 'row',
          alignContent: 'space-between',
          height: verticalScale(40),
        },
        headingTitle: {
          width: '50%',
          justifyContent: 'center',
        },
        headingLink: {
          width: '50%',
          ...alignment.PRsmall,
          ...alignment.PLlarge,
        },
        headingButton: {
          height: '100%',
          alignItems: 'flex-end',
          justifyContent: 'center',
          ...alignment.PRsmall,
        },
        inputLabel: {
          ...alignment.MTsmall,
          ...alignment.MBxSmall,
        },
        input: {
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.fontSecondColor,
          paddingVertical: scale(6),
          fontSize: scale(14),
          color: colors.fontMainColor,
        },
        inputError: {
          color: colors.google,
          fontSize: scale(10),
          ...alignment.MTxSmall,
        },
        saveContainer: {
          marginTop: scale(20),
          width: '40%',
          backgroundColor: colors.drawerTitleColor,
          justifyContent: 'center',
          alignItems: 'center',
          alignSelf: 'flex-end',
          borderRadius: scale(6),
          ...alignment.PTxSmall,
          ...alignment.PBxSmall,
        },
        changePassRow: {
          ...alignment.MTmedium,
          flexDirection: 'row',
          justifyContent: 'flex-end',
        },
      }),
    [colors],
  );
};
