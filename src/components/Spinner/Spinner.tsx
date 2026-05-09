import { useTheme } from '@react-navigation/native';
import React from 'react';
import { ActivityIndicator } from 'react-native';

function Spinner(props: SpinnerProps) {
  const { colors } = useTheme() as NavigationTheme;
  return (
    <ActivityIndicator
      animating
      style={{
        flex: 1,
        height: '100%',
        width: '100%',
        backgroundColor: props.backColor ?? colors.mainBackground,
      }}
      size={props.size ?? 'large'}
      color={props.spinnerColor ?? colors.spinnerColor}
    />
  );
}

export default React.memo(Spinner);
