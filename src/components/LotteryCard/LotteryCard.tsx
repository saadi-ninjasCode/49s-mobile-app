import { useTheme } from '@react-navigation/native';
import React from 'react';
import { View } from 'react-native';
import type { LotteryDraw } from '../../types';
import { dateTransformation, getZone } from '../../utilities';
import { TextDefault } from '../Text';
import { useStyles } from './styles';

function LotteryCard(props: LotteryDraw) {
  const { colors } = useTheme() as NavigationTheme;
  const styles = useStyles();
  return (
    <View style={styles.lotteryBox}>
      <View style={styles.boxHeader}>
        <TextDefault textColor={colors.headerBackground} H3 bold center>
          {props.lottery.name}
          {' Results'}
        </TextDefault>
      </View>
      <View style={styles.boxContainer}>
        <View style={styles.boxInfo}>
          <TextDefault numberOfLines={1} textColor={colors.headerText} H5 bold>
            {dateTransformation(props.date ?? null, true)}
          </TextDefault>
          <TextDefault numberOfLines={1} textColor={colors.headerText}>
            {getZone(props.date ?? null)}
          </TextDefault>
          <View style={styles.lotteryBalls}>
            {props.pending ? (
              <TextDefault textColor={colors.yellow} H4 bold>
                {'Result Pending'}
              </TextDefault>
            ) : (
              <>
                {props.balls.filter(Boolean).map((item, index) => (
                  <View style={[styles.ballContainer, { backgroundColor: colors.yellow }]} key={index}>
                    <TextDefault style={styles.font} textColor={colors.headerBackground} bold H4 center>
                      {item}
                    </TextDefault>
                  </View>
                ))}
                {props.specialBalls.filter(Boolean).map((item, index) => (
                  <View style={[styles.ballContainer, { backgroundColor: colors.green }]} key={index}>
                    <TextDefault style={styles.font} textColor={colors.headerBackground} bold H4 center>
                      {item}
                    </TextDefault>
                  </View>
                ))}
              </>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

export default React.memo(LotteryCard);
