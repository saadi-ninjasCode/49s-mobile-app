import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { colors, timeDifference } from '../../utilities';
import { TextDefault } from '../Text';
import styles from './styles';

export interface CounterProps {
  time?: number | null;
}

function Counter({ time }: Readonly<CounterProps>) {
  const next_draw = time ?? null;
  const [timeLeft, setTimeLeft] = useState(() => timeDifference(next_draw));

  useEffect(() => {
    setTimeLeft(timeDifference(next_draw));
    if (next_draw == null) return;
    const id = setInterval(() => {
      setTimeLeft(timeDifference(next_draw));
    }, 1000);
    return () => clearInterval(id);
  }, [next_draw]);

  return (
    <View style={styles.counterBox}>
      <TextDefault textColor={colors.headerBackground} style={styles.leftSide} center bold>
        {'Next Draw'}
      </TextDefault>
      <View style={styles.counterContainer}>
        {timeLeft ? (
          <>
            <View style={styles.timerbox}>
              <TextDefault textColor={colors.headerBackground} small>{'Days'}</TextDefault>
              <TextDefault textColor={colors.white} center bold>{String(timeLeft.days)}</TextDefault>
            </View>
            <View style={styles.timerbox}>
              <TextDefault textColor={colors.headerBackground} small>{'Hour'}</TextDefault>
              <TextDefault textColor={colors.white} center bold>{String(timeLeft.hours)}</TextDefault>
            </View>
            <View style={styles.timerbox}>
              <TextDefault textColor={colors.headerBackground} small>{'Min'}</TextDefault>
              <TextDefault textColor={colors.white} center bold>{String(timeLeft.minutes)}</TextDefault>
            </View>
            <View style={styles.timerbox}>
              <TextDefault textColor={colors.headerBackground} small>{'Sec'}</TextDefault>
              <TextDefault textColor={colors.white} center bold>{String(timeLeft.seconds)}</TextDefault>
            </View>
          </>
        ) : (
          <TextDefault textColor={colors.drawerTitleColor} center bold H4>
            {'Pending'}
          </TextDefault>
        )}
      </View>
    </View>
  );
}

export default React.memo(Counter);
