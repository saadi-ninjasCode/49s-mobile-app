import { FontAwesome5 } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';
import type { DashboardEntry } from '../../types';
import { alignment, colors, dateTransformation, getTime, scale } from '../../utilities';
import Counter from '../Counter/Counter';
import { TextDefault } from '../Text';
import styles from './styles';

type FontAwesome5Glyph = React.ComponentProps<typeof FontAwesome5>['name'];

function MainCard(props: DashboardEntry) {
  const iconName = props.lottery.icon_name as FontAwesome5Glyph;
  return (
    <View>
      <View style={styles.lotteryBox}>
        <View style={styles.boxHeader}>
          <TextDefault textColor={colors.headerBackground} H3 bold center>
            {props.lottery.name}
          </TextDefault>
          <FontAwesome5 name={iconName} size={scale(20)} color={colors.drawerTitleColor} />
        </View>
        <View style={styles.boxContainer}>
          <View style={styles.boxInfo}>
            <TextDefault numberOfLines={1} textColor={colors.headerText} H5 bold>
              {dateTransformation(props.draw ? props.draw.date : null, true)}
            </TextDefault>
            <TextDefault numberOfLines={1} textColor={colors.headerText} style={alignment.MTxSmall}>
              {getTime(props.draw ? props.draw.date : null)}{' '}
              <TextDefault numberOfLines={1} textColor={colors.fontSecondColor} small>
                {' '}
                {' (Europe/London)'}
              </TextDefault>
            </TextDefault>
            <View style={styles.lotteryBalls}>
              {props.draw &&
                (props.draw.pending ? (
                  <TextDefault textColor={colors.yellow} H4 bold>
                    {'Result Pending'}
                  </TextDefault>
                ) : (
                  <>
                    {props.draw.balls.filter(Boolean).map((item, index) => (
                      <View style={[styles.ballContainer, { backgroundColor: colors.yellow }]} key={index}>
                        <TextDefault style={styles.font} textColor={colors.headerBackground} bold H4 center>
                          {item}
                        </TextDefault>
                      </View>
                    ))}
                    {props.draw.specialBalls.filter(Boolean).map((item, index) => (
                      <View style={[styles.ballContainer, { backgroundColor: colors.green }]} key={index}>
                        <TextDefault style={styles.font} textColor={colors.headerBackground} bold H4 center>
                          {item}
                        </TextDefault>
                      </View>
                    ))}
                  </>
                ))}
            </View>
          </View>
        </View>
        <Counter time={props.lottery.next_draw} />
      </View>
    </View>
  );
}

export default React.memo(MainCard);
