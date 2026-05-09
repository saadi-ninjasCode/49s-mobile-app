import { useTheme } from "@react-navigation/native";
import React from "react";
import { View } from "react-native";
import { TextDefault } from "../Text";
import { useStyles } from "./styles";

function Balls({ name, color, array }: BallsProps) {
  const { colors } = useTheme() as NavigationTheme;
  const styles = useStyles();
  return (
    <View style={styles.box}>
      <View style={[styles.header, { borderColor: color }]}>
        <TextDefault textColor={color} H4 bold center>
          {name}
        </TextDefault>
      </View>
      <View style={styles.boxContainer}>
        <View style={styles.boxInfo}>
          <View style={styles.ballRow}>
            {array.map((objBall, i) => (
              <View style={styles.ballItem} key={i}>
                <View style={[styles.ballContainer, { backgroundColor: color }]}>
                  <TextDefault textColor={colors.fontWhite} bold H3 center>
                    {objBall.ball}
                  </TextDefault>
                </View>
                <TextDefault textColor={colors.facebook} bold H4>
                  {objBall.times}
                  {" times"}
                </TextDefault>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

export default React.memo(Balls);
