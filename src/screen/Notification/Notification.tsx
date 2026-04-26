import React, { useState } from 'react';
import { FlatList, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { dashboardInfo } from '../../mock/dashboard';
import type { Lottery } from '../../types';
import NotificationCard from './NotificationCard';
import { useStyles } from './styles';

type EnabledMap = Record<string, boolean>;

function Notification() {
  const styles = useStyles();
  const [enabled, setEnabled] = useState<EnabledMap>(() => {
    const seed: EnabledMap = {};
    dashboardInfo.forEach((entry, idx) => {
      seed[entry.lottery._id] = idx % 2 === 0;
    });
    return seed;
  });

  const lotteries: Lottery[] = dashboardInfo.map((entry) => entry.lottery);

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.flex}>
      <View style={styles.flex}>
        <FlatList<Lottery>
          data={lotteries}
          style={[styles.flex, styles.mainBackground]}
          contentContainerStyle={styles.scrollContent}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <NotificationCard
              name={item.name}
              checked={!!enabled[item._id]}
              onToggle={() =>
                setEnabled((prev) => ({ ...prev, [item._id]: !prev[item._id] }))
              }
            />
          )}
        />
      </View>
    </SafeAreaView>
  );
}

export default React.memo(Notification);
