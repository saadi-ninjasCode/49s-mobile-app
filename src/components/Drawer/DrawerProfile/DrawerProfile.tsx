import { useTheme } from '@react-navigation/native';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { TextDefault } from '../../Text';
import { useStyles } from './styles';

function DrawerProfile() {
  const { colors } = useTheme() as NavigationTheme;
  const styles = useStyles();
  return (
    <View style={styles.mainContainer}>
      <View style={styles.loginContainer}>
        <TouchableOpacity style={styles.touchSpace} activeOpacity={0.7}>
          <TextDefault textColor={colors.fontWhite} style={styles.font} H4>
            {'Login/Create Account'}
          </TextDefault>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default DrawerProfile;
