import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { AppState, FlatList, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNotificationPrefs } from "../../Lib/PushNotification/NotificationProvider";
import * as NotificationService from "../../Lib/PushNotification/NotificationService";
import { fetchDrawTypes } from "../../services/firestore";
import NotificationCard from "./NotificationCard";
import { useStyles } from "./styles";

function Notification() {
  const styles = useStyles();
  const { enabled, toggle } = useNotificationPrefs();
  const [drawTypes, setDrawTypes] = useState<DrawType[]>([]);
  useFocusEffect(
    useCallback(() => {
      NotificationService.ensurePermissionOrPromptSettings().catch(() => {});
    }, []),
  );

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        NotificationService.ensurePermissionOrPromptSettings().catch(() => {});
      }
    });
    return () => subscription.remove();
  }, []);

  const handleToggle = useCallback(
    async (drawTypeId: string) => {
      const turningOff = !!enabled[drawTypeId];
      if (turningOff) {
        toggle(drawTypeId);
        return;
      }
      const ok = await NotificationService.ensurePermissionOrPromptSettings(drawTypeId);
      if (ok) toggle(drawTypeId);
    },
    [enabled, toggle],
  );

  useEffect(() => {
    let cancelled = false;
    fetchDrawTypes().then((items) => {
      if (!cancelled) setDrawTypes(items);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <SafeAreaView edges={["bottom", "left", "right"]} style={styles.flex}>
      <View style={styles.flex}>
        <FlatList<DrawType>
          data={drawTypes}
          style={[styles.flex, styles.mainBackground]}
          contentContainerStyle={styles.scrollContent}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <NotificationCard name={item.name} checked={!!enabled[item._id]} onToggle={() => handleToggle(item._id)} />
          )}
        />
      </View>
    </SafeAreaView>
  );
}

export default React.memo(Notification);
