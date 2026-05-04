import { useTheme } from '@react-navigation/native';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useStyles } from './styles';

function FooterLoader() {
  const { colors } = useTheme() as NavigationTheme;
  const styles = useStyles();
  return (
    <View style={styles.footer}>
      <ActivityIndicator size="small" color={colors.spinnerColor} />
    </View>
  );
}

export default React.memo(FooterLoader);
