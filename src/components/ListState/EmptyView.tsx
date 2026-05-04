import { useTheme } from '@react-navigation/native';
import React from 'react';
import { Pressable, View } from 'react-native';
import TextDefault from '../Text/TextDefault/TextDefault';
import { useStyles } from './styles';

export interface EmptyViewProps {
  message?: string;
  buttonLabel?: string;
  onRetry?: () => void;
}

function EmptyView({
  message = 'No data available.',
  buttonLabel = 'Refresh',
  onRetry,
}: EmptyViewProps) {
  const { colors } = useTheme() as NavigationTheme;
  const styles = useStyles();
  return (
    <View style={styles.center}>
      <TextDefault H5 center bold textColor={colors.fontSecondColor} style={styles.message}>
        {message}
      </TextDefault>
      {onRetry && (
        <Pressable
          onPress={onRetry}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <TextDefault bold textColor={colors.fontWhite}>
            {buttonLabel}
          </TextDefault>
        </Pressable>
      )}
    </View>
  );
}

export default React.memo(EmptyView);
