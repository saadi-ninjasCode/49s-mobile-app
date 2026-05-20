import { useTheme } from '@react-navigation/native';
import React from 'react';
import { ActivityIndicator, Modal, Pressable, View } from 'react-native';
import { TextDefault } from '../Text';
import { useStyles } from './styles';

/**
 * Pre-watch confirmation for a rewarded ad.
 *
 * Google's rewarded-ads policy requires explicit user opt-in with the reward
 * spelled out *before* the ad loads. The exact phrasing "You'll see a video
 * ad. Reward: …" + Watch / No Thanks buttons is what the policy expects.
 *
 * The modal handles its own busy state while the parent triggers `onConfirm`;
 * once the ad starts loading the parent sets `busy={true}` so we show a
 * spinner instead of letting the user tap "Watch Ad" again.
 */
function RewardedConfirmModal(props: Readonly<RewardedConfirmModalProps>) {
  const { colors } = useTheme() as NavigationTheme;
  const styles = useStyles();
  const busy = props.busy === true;

  return (
    <Modal
      visible={props.visible}
      transparent
      animationType="fade"
      onRequestClose={props.onCancel}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <TextDefault H3 bold center textColor={colors.fontMainColor} style={styles.title}>
            {props.title}
          </TextDefault>

          <TextDefault center textColor={colors.fontSecondColor} style={styles.body}>
            {"You'll see a video ad."}
          </TextDefault>
          <TextDefault center bold textColor={colors.fontMainColor} style={styles.reward}>
            {`Reward: ${props.rewardLabel}`}
          </TextDefault>

          <Pressable
            disabled={busy}
            onPress={props.onConfirm}
            android_ripple={{ color: colors.headerBackground, foreground: true }}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && !busy && styles.pressed,
              busy && styles.disabled,
            ]}
          >
            {busy ? (
              <ActivityIndicator color={colors.fontWhite} />
            ) : (
              <TextDefault bold center textColor={colors.fontWhite} style={styles.primaryButtonText}>
                {'Watch Ad'}
              </TextDefault>
            )}
          </Pressable>

          <Pressable
            disabled={busy}
            onPress={props.onCancel}
            android_ripple={{ color: colors.drawerSelected, foreground: true }}
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && !busy && styles.pressed,
            ]}
          >
            <TextDefault center textColor={colors.fontSecondColor}>
              {'No Thanks'}
            </TextDefault>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export default React.memo(RewardedConfirmModal);
