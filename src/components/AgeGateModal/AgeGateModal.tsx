import { useTheme } from "@react-navigation/native";
import React, { useCallback } from "react";
import { Pressable, View } from "react-native";
import { TextDefault } from "../Text";
import { useStyles } from "./styles";

/**
 * One-time age confirmation shown over the BootSplash on first launch.
 *
 * Renders a full-screen view (not RN `<Modal>`) so it sits in the same z-stack
 * as `BootSplash` and the drawer never mounts until the user decides. The choice
 * is persisted in SQLite (`app_prefs.age_gate_accepted`) by the caller.
 */
function AgeGateModal({ onDecision }: Readonly<AgeGateModalProps>) {
  const { colors } = useTheme() as NavigationTheme;
  const styles = useStyles();

  const handleConfirm = useCallback(() => {
    onDecision(true);
  }, [onDecision]);

  const handleDeny = useCallback(() => {
    onDecision(false);
  }, [onDecision]);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <TextDefault H4 bold center textColor={colors.fontMainColor} style={styles.title}>
          {"Are you 18 or over?"}
        </TextDefault>

        <TextDefault center textColor={colors.fontSecondColor} style={styles.body}>
          {"This app shows UK 49’s lottery results and statistics for general information only. " +
            "You must be 18 or over to continue."}
        </TextDefault>

        <Pressable
          onPress={handleConfirm}
          android_ripple={{ color: colors.headerBackground, foreground: true }}
          style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
        >
          <TextDefault bold center textColor={colors.fontWhite} style={styles.primaryButtonText}>
            {"I am 18 or over"}
          </TextDefault>
        </Pressable>

        <Pressable
          onPress={handleDeny}
          android_ripple={{ color: colors.drawerSelected, foreground: true }}
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
        >
          <TextDefault center textColor={colors.fontSecondColor} style={styles.secondaryButtonText}>
            {"I am under 18"}
          </TextDefault>
        </Pressable>
      </View>
    </View>
  );
}

export default React.memo(AgeGateModal);
