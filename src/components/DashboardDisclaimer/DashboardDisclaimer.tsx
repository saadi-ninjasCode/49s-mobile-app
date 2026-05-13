import { useTheme } from '@react-navigation/native';
import React from 'react';
import { View } from 'react-native';
import { TextDefault } from '../Text';
import { useStyles } from './styles';

function DashboardDisclaimer() {
  const styles = useStyles();
  const { colors } = useTheme() as NavigationTheme;
  return (
    <View style={styles.container}>
      <TextDefault H5 bold center textColor={colors.primary} style={styles.title}>
        {'Disclaimer'}
      </TextDefault>
      <TextDefault textColor={colors.fontSecondColor} style={styles.text}>
        {
          'This is not an official app from any official lottery organisation or entity. Tickets cannot be purchased with this app. Please check your ticket at an official outlet before discarding. All content on this app is for general information purposes only. We do not take any responsibility for the accuracy of the information provided here.'
        }
      </TextDefault>
    </View>
  );
}

export default React.memo(DashboardDisclaimer);
