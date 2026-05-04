import { useTheme } from '@react-navigation/native';
import React from 'react';
import { Pressable, View } from 'react-native';
import TextDefault from '../Text/TextDefault/TextDefault';
import { useStyles } from './styles';

export interface ErrorViewProps {
  message?: string;
  buttonLabel?: string;
  onRetry: () => void;
}

function ErrorView({
  message = 'Something went wrong.',
  buttonLabel = 'Try again',
  onRetry,
}: ErrorViewProps) {
  const { colors } = useTheme() as NavigationTheme;
  const styles = useStyles();
  return (
    <View style={styles.center}>
      <TextDefault H5 center bold textColor={colors.brandAccent} style={styles.message}>
        {message}
      </TextDefault>
      <Pressable
        onPress={onRetry}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <TextDefault bold textColor={colors.fontWhite}>
          {buttonLabel}
        </TextDefault>
      </Pressable>
    </View>
  );
}

export default React.memo(ErrorView);
