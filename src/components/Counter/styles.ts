import { StyleSheet } from 'react-native';
import { alignment, colors, scale } from '../../utilities';

const styles = StyleSheet.create({
  counterBox: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.headerBackground,
    borderBottomEndRadius: scale(10),
    borderBottomStartRadius: scale(10),
    ...alignment.PxSmall,
  },
  leftSide: {
    width: '30%',
  },
  counterContainer: {
    width: '70%',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    flexDirection: 'row',
    ...alignment.PxSmall,
  },
  timerbox: {
    height: scale(35),
    width: scale(35),
    borderRadius: scale(3),
    paddingHorizontal: scale(3),
    paddingVertical: scale(3),
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.drawerTitleColor,
  },
});

export default styles;
