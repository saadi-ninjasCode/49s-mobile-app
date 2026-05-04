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
        sectionHeader: {
          backgroundColor: colors.headerBackground,
          ...alignment.MBmedium,
          ...alignment.PTxSmall,
          ...alignment.PBxSmall,
        },
        box: {
          ...alignment.PLlarge,
          ...alignment.PRlarge,
        },
        header: {
          width: '80%',
          height: scale(32),
          backgroundColor: colors.white,
          borderWidth: scale(1),
          borderColor: colors.facebook,
          borderRadius: 50,
          alignSelf: 'center',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1,
        },
        boxContainer: {
          backgroundColor: colors.white,
          borderWidth: scale(1),
          width: '100%',
          borderRadius: scale(10),
          marginTop: -scale(16),
          alignItems: 'center',
          ...alignment.PBmedium,
          ...alignment.MBmedium,
        },
        boxInfo: {
          width: '100%',
          alignItems: 'center',
          ...alignment.MTlarge,
          ...alignment.PTlarge,
          ...alignment.PLxSmall,
          ...alignment.PRxSmall,
        },
        ballRow: {
          width: '100%',
          backgroundColor: 'transparent',
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-evenly',
        },
        ballContainer: {
          width: scale(50),
          height: scale(50),
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: scale(25),
          ...alignment.MTxSmall,
          ...alignment.MBsmall,
        },
      }),
    [colors],
  );
};
