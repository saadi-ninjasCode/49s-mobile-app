import { useTheme } from '@react-navigation/native';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import Checkbox from '../../components/Checkbox/Checkbox';
import { TextDefault } from '../../components/Text';
import { alignment } from '../../utilities';
import { useStyles } from './styles';

export interface NotificationCardProps {
  name: string;
  checked: boolean;
  onToggle: () => void;
}

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
