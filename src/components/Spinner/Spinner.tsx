import React from 'react';
import { ActivityIndicator } from 'react-native';
import { colors } from '../../utilities';

export interface SpinnerProps {
  backColor?: string;
  spinnerColor?: string;
  size?: 'small' | 'large';
}

function Spinner(props: SpinnerProps) {
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
