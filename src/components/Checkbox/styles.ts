import { StyleSheet } from 'react-native';
import { colors, scale } from '../../utilities';

const styles = StyleSheet.create({
  mainContainer: {
    borderColor: colors.boxShadow,
    borderWidth: StyleSheet.hairlineWidth,
    width: scale(20),
    height: scale(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default styles;
