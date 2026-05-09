import { useTheme } from '@react-navigation/native';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { alignment } from '../../utilities';
import Checkbox from '../Checkbox/Checkbox';
import { TextDefault } from '../Text';
import { useStyles } from './styles';

function NotificationCard(props: NotificationCardProps) {
  const { colors } = useTheme() as NavigationTheme;
  const styles = useStyles();
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
