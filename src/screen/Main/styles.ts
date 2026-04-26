import { StyleSheet } from 'react-native';
import { alignment, colors } from '../../utilities';

const styles = StyleSheet.create({
  flex: { flex: 1 },
  mainBackground: { backgroundColor: colors.mainBackground },
  mainContainer: {
    flexGrow: 1,
    backgroundColor: 'transparent',
    ...alignment.PTlarge,
    ...alignment.PBlarge,
    ...alignment.PLxSmall,
    ...alignment.PRxSmall,
  },
  seperator: {
    ...alignment.MTsmall,
    ...alignment.MBsmall,
  },
});

export default styles;
