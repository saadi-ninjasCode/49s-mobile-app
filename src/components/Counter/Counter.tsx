import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { colors, timeDifference } from '../../utilities';
import { TextDefault } from '../Text';
import styles from './styles';

export interface CounterProps {
  time?: number | null;
}

function Counter({ time }: CounterProps) {
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const next_draw = time ?? null;
  const [timeLeft, setTimeLeft] = useState(() => timeDifference(next_draw));

  useEffect(() => {
    if (timeLeft != null) {
      const id = setInterval(() => {
        setTimeLeft(timeDifference(next_draw));
      }, 1000);
      timer.current = id;
    }
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [next_draw, timeLeft]);

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
