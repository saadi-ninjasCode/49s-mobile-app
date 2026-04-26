import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { colors } from '../../../utilities';
import { TextDefault } from '../../Text';
import styles from './styles';

function DrawerProfile() {
  return (
    <View style={styles.mainContainer}>
      <View style={styles.loginContainer}>
        <TouchableOpacity style={styles.touchSpace} activeOpacity={0.7}>
          <TextDefault textColor={colors.drawerColor} style={styles.font} H4>
            {'Login/Create Account'}
          </TextDefault>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default DrawerProfile;
