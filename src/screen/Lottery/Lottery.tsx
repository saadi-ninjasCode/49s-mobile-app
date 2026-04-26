import { useTheme } from '@react-navigation/native';
import React from 'react';
import { FlatList, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LotteryCard from '../../components/LotteryCard/LotteryCard';
import { TextDefault, TextError } from '../../components/Text';
import { getDrawsForLottery } from '../../mock/draws';
import type { LotteryDraw } from '../../types';
import { useStyles } from './styles';

export interface LotteryProps {
  lotteryId?: string | null;
}

function Lottery({ lotteryId }: LotteryProps) {
  const { colors } = useTheme() as NavigationTheme;
  const styles = useStyles();
  const draws = getDrawsForLottery(lotteryId);

  if (!draws.length) {
    return <TextError text={'Data is not available now.'} textColor={colors.brandAccent} />;
  }

  const latest: LotteryDraw = draws[0];
  const previous: LotteryDraw[] = draws.slice(1);

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.flex}>
      <FlatList<LotteryDraw>
        data={previous}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item._id}
        style={styles.flex}
        ListHeaderComponent={() => (
          <>
            <View style={styles.headerStyles}>
              <TextDefault textColor={colors.fontWhite} H3 center>
                {'Latest Result'}
              </TextDefault>
            </View>
            <LotteryCard {...latest} />
            <View style={styles.seperator} />
            <View style={styles.headerStyles}>
              <TextDefault textColor={colors.fontWhite} H3 center>
                {'Previous Result'}
              </TextDefault>
            </View>
          </>
        )}
        ItemSeparatorComponent={() => <View style={styles.seperator} />}
        contentContainerStyle={[styles.mainBackground, styles.mainContainer]}
        renderItem={({ item }) => <LotteryCard {...item} />}
      />
    </SafeAreaView>
  );
}

export default React.memo(Lottery);
