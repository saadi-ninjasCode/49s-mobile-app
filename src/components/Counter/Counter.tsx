import { useTheme } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { timeDifference } from '../../utilities';
import { TextDefault } from '../Text';
import { useStyles } from './styles';

export interface CounterProps {
  time?: number | null;
}

function Counter({ time }: Readonly<CounterProps>) {
  const { colors } = useTheme() as NavigationTheme;
  const styles = useStyles();
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
      <TextDefault textColor={colors.brandAccent} style={styles.leftSide} center bold>
        {'Next Draw'}
      </TextDefault>
      <View style={styles.counterContainer}>
        {timeLeft ? (
          <>
            <View style={styles.timerbox}>
              <TextDefault textColor={colors.headerBackground} small numberOfLines={1}>{'Days'}</TextDefault>
              <TextDefault textColor={colors.white} center bold numberOfLines={1}>{String(timeLeft.days)}</TextDefault>
            </View>
            <View style={styles.timerbox}>
              <TextDefault textColor={colors.headerBackground} small numberOfLines={1}>{'Hour'}</TextDefault>
              <TextDefault textColor={colors.white} center bold numberOfLines={1}>{String(timeLeft.hours)}</TextDefault>
            </View>
            <View style={styles.timerbox}>
              <TextDefault textColor={colors.headerBackground} small numberOfLines={1}>{'Min'}</TextDefault>
              <TextDefault textColor={colors.white} center bold numberOfLines={1}>{String(timeLeft.minutes)}</TextDefault>
            </View>
            <View style={styles.timerbox}>
              <TextDefault textColor={colors.headerBackground} small numberOfLines={1}>{'Sec'}</TextDefault>
              <TextDefault textColor={colors.white} center bold numberOfLines={1}>{String(timeLeft.seconds)}</TextDefault>
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
