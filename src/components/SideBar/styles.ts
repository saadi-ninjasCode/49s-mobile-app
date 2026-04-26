import { StyleSheet } from 'react-native';
import { alignment, colors, scale } from '../../utilities';

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    backgroundColor: colors.drawerColor,
  },
  flexBg: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  transparent: {
    backgroundColor: 'transparent',
  },
  font: {
    fontWeight: '400',
    ...alignment.PLmedium,
  },
  headerContainer: {
    justifyContent: 'center',
    height: scale(200),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.2)',
    backgroundColor: colors.draweHeader,
    ...alignment.Pmedium,
  },
  menuContainer: {
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
    ...alignment.PTxSmall,
  },
  bottomMenu: {
    borderTopColor: 'rgba(255,255,255,0.15)',
    borderTopWidth: StyleSheet.hairlineWidth,
    ...alignment.MTsmall,
  },
  line: {
    ...alignment.MTxSmall,
    ...alignment.MBxSmall,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.15)',
  },
  resultContainer: {
    ...alignment.PLlarge,
  },
});

export default styles;
