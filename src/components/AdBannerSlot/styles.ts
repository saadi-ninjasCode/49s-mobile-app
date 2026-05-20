import { useTheme } from '@react-navigation/native';
import { StyleSheet } from 'react-native';
import { scale } from '../../utilities/scaling';

export const useStyles = () => {
  const { colors } = useTheme() as NavigationTheme;
  return StyleSheet.create({
    container: {
      // Reserves enough vertical space for an anchored adaptive banner to
      // load without causing a layout jump. Actual banner height varies
      // 50–100dp depending on device width.
      minHeight: scale(50),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.mainBackground,
    },
  })
};
