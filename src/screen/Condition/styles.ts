import { StyleSheet } from 'react-native';
import { alignment, colors } from '../../utilities';

const styles = StyleSheet.create({
  flex: { flex: 1 },
  mainBackground: {
    backgroundColor: colors.mainBackground,
    ...alignment.Pmedium,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
  },
  textAlignment: {
    textAlign: 'justify',
    ...alignment.PBlarge,
  },
});

export default styles;
