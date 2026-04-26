import { StyleSheet } from 'react-native';
import { alignment, colors } from '../../utilities';

const styles = StyleSheet.create({
  flex: { flex: 1 },
  mainBackground: {
    backgroundColor: colors.mainBackground,
    ...alignment.Pmedium,
  },
  scrollContent: {
    alignItems: 'center',
    justifyContent: 'center',
    ...alignment.PBlarge,
  },
  notificationContainer: {
    width: '100%',
    backgroundColor: colors.cartContainer,
    flexDirection: 'row',
    justifyContent: 'space-between',
    ...alignment.PTlarge,
    ...alignment.PBlarge,
    ...alignment.PRsmall,
    ...alignment.PLsmall,
    ...alignment.MTxSmall,
    ...alignment.MBxSmall,
  },
  shadow: {
    shadowColor: colors.boxShadow,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.boxShadow,
  },
  notificationChekboxContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default styles;
