import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import Checkbox from '../../components/Checkbox/Checkbox';
import { TextDefault } from '../../components/Text';
import { alignment, colors } from '../../utilities';
import styles from './styles';

export interface NotificationCardProps {
  name: string;
  checked: boolean;
  onToggle: () => void;
}

function NotificationCard(props: NotificationCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={props.onToggle}
      style={[styles.notificationContainer, styles.shadow]}>
      <View style={styles.notificationChekboxContainer}>
        <Checkbox checked={props.checked} onPress={props.onToggle} />
        <TextDefault numberOfLines={1} textColor={colors.fontMainColor} style={alignment.MLsmall}>
          {' Receive Notification for '}
          {props.name}
        </TextDefault>
      </View>
    </TouchableOpacity>
  );
}

export default React.memo(NotificationCard);
