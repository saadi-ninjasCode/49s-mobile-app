import React from 'react';
import { FlatList, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MainCard from '../../components/MainCard/MainCard';
import { dashboardInfo } from '../../mock/dashboard';
import type { DashboardEntry } from '../../types';
import { useStyles } from './styles';

function Main() {
  const styles = useStyles();
  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.flex}>
      <FlatList<DashboardEntry>
        data={dashboardInfo}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.drawType._id}
        style={styles.flex}
        ItemSeparatorComponent={() => <View style={styles.seperator} />}
        contentContainerStyle={[styles.mainBackground, styles.mainContainer]}
        renderItem={({ item }) => <MainCard {...item} />}
      />
    </SafeAreaView>
  );
}

export default React.memo(Main);
