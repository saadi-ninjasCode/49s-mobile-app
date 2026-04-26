import { FontAwesome5 } from '@expo/vector-icons';
import React from 'react';
import { TouchableOpacity, type GestureResponderEvent } from 'react-native';
import { colors, scale } from '../../utilities';
import styles from './styles';

export interface CheckboxProps {
  checked: boolean;
  onPress?: (event: GestureResponderEvent) => void;
}

function Checkbox(props: CheckboxProps) {
  return (
    <TouchableOpacity
      onPress={props.onPress}
      style={[
        styles.mainContainer,
        props.checked
          ? { backgroundColor: colors.checkBoxColor }
          : { backgroundColor: colors.white },
      ]}>
      {props.checked ? (
        <FontAwesome5 name="check" size={scale(15)} color={colors.fontWhite} />
      ) : null}
    </TouchableOpacity>
  );
}

export default React.memo(Checkbox);
