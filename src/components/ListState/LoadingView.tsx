import { useTheme } from '@react-navigation/native';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useStyles } from './styles';

function LoadingView() {
  const { colors } = useTheme() as NavigationTheme;
  const styles = useStyles();
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={colors.spinnerColor} />
    </View>
  );
}

export default React.memo(LoadingView);
