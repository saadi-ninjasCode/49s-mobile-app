import { useTheme } from '@react-navigation/native';
import React from 'react';
import { Pressable, View } from 'react-native';
import TextDefault from '../Text/TextDefault/TextDefault';
import { useBannerStyles } from './styles';

export interface InlineErrorBannerProps {
  message?: string;
  onRetry: () => void;
}

function InlineErrorBanner({
  message = "Couldn't refresh.",
  onRetry,
}: InlineErrorBannerProps) {
  const { colors } = useTheme() as NavigationTheme;
  const styles = useBannerStyles();
  return (
    <View style={styles.banner}>
      <TextDefault textColor={colors.fontWhite} small>
        {message}
      </TextDefault>
      <Pressable
        onPress={onRetry}
        style={({ pressed }) => [styles.retry, pressed && styles.pressed]}
      >
        <TextDefault textColor={colors.fontWhite} bold small>
          {'Tap to retry'}
        </TextDefault>
      </Pressable>
    </View>
  );
}

export default React.memo(InlineErrorBanner);
