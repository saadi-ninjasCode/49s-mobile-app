import { useTheme } from '@react-navigation/native';
import React, { useRef, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextDefault } from '../../components/Text';
import { useStyles } from './styles';

type BallValue = number | '?';

function Generator() {
  const { colors } = useTheme() as NavigationTheme;
  const styles = useStyles();
  const [balls, setBalls] = useState<BallValue[]>(['?', '?', '?', '?', '?', '?', '?']);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  function generate() {
    if (timer.current) clearInterval(timer.current);
    const id = setInterval(() => {
      setBalls(Array.from({ length: 7 }, () => Math.floor(Math.random() * 49) + 1));
    }, 50);
    timer.current = id;
    setTimeout(() => {
      if (timer.current) clearInterval(timer.current);
    }, 2000);
  }

  return (
    <SafeAreaView style={[styles.flex, styles.mainBackground]}>
      <View style={styles.box}>
        <View style={styles.header}>
          <TextDefault textColor={colors.headerBackground} H4 bold center>
            {'Number Generator'}
          </TextDefault>
        </View>
        <View style={styles.boxContainer}>
          <View style={styles.boxInfo}>
            <View style={styles.lotteryBalls}>
              {balls.map((value, index) => (
                <View style={styles.ballContainer} key={index}>
                  <TextDefault textColor={colors.headerBackground} bold H4 center>
                    {value}
                  </TextDefault>
                </View>
              ))}
            </View>
            <TouchableOpacity style={styles.btn} onPress={generate} activeOpacity={0.7}>
              <TextDefault textColor={colors.white} H4 bold>
                {'Generate'}
              </TextDefault>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

export default React.memo(Generator);
