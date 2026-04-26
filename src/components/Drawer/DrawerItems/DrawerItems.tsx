import { FontAwesome5 } from '@expo/vector-icons';
import { DrawerItem } from '@react-navigation/drawer';
import React from 'react';
import { colors, scale } from '../../../utilities';
import { TextDefault } from '../../Text';
import styles from './styles';

type FontAwesome5Glyph = React.ComponentProps<typeof FontAwesome5>['name'];

export interface DrawerItemsProps {
  name?: string;
  icon: string;
  text: string;
  active?: boolean;
  onPress: () => void;
}

function DrawerItems(props: DrawerItemsProps) {
  const isActive = props.active === true;
  return (
    <DrawerItem
      style={[
        { marginVertical: 0, backgroundColor: 'transparent' },
        isActive && { backgroundColor: colors.drawerSelected },
      ]}
      onPress={props.onPress}
      label={() => (
        <TextDefault style={styles.font} textColor={colors.draweHeader}>
          {' '}
          {props.text}
        </TextDefault>
      )}
      icon={() => (
        <FontAwesome5 name={props.icon as FontAwesome5Glyph} size={scale(15)} color="white" />
      )}
    />
  );
}

export default DrawerItems;
