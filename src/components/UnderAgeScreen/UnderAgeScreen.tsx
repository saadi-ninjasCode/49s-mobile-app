import { useTheme } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import React from 'react';
import { Image, Pressable, View } from 'react-native';
import { TextDefault } from '../Text';
import { useStyles } from './styles';

const LOGO = require('../../../assets/images/logo-image.png');

/**
 * Rendered by `_layout.tsx` instead of the drawer when
 * `app_prefs.age_gate_accepted === false`. No drawer, no ads, no SDK init.
 *
 * `onRetry` clears the persisted decision and sends the user back to
 * `AgeGateModal` so an accidental tap doesn't require a reinstall.
 */
function UnderAgeScreen({ onRetry }: Readonly<UnderAgeScreenProps>) {
  const { colors } = useTheme() as NavigationTheme;
  const styles = useStyles();

  return (
    <View style={styles.container}>
      <Image source={LOGO} style={styles.logo} resizeMode="contain" />

      <FontAwesome5
        name="shield-alt"
        size={48}
        color={colors.fontWhite}
        style={styles.icon}
      />

      <TextDefault H3 bold center textColor={colors.fontWhite} style={styles.title}>
        {'Sorry — 18+ only'}
      </TextDefault>

      <TextDefault center textColor={colors.fontWhite} style={styles.body}>
        {'This app contains lottery-related content and is only available to ' +
          'users aged 18 or over. Tapped this by mistake?'}
      </TextDefault>

      <Pressable
        onPress={onRetry}
        android_ripple={{ color: colors.headerBackground, foreground: true }}
        style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
      >
        <TextDefault
          bold
          center
          textColor={colors.fontWhite}
          style={styles.retryButtonText}
        >
          {'Re-confirm my age'}
        </TextDefault>
      </Pressable>
    </View>
  );
}

export default React.memo(UnderAgeScreen);
