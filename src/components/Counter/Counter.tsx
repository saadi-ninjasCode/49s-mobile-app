import { useTheme } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { nextDrawTimestamp, timeDifference, todaysDrawTimestamp } from "../../utilities";
import { TextDefault } from "../Text";
import { useStyles } from "./styles";

const PENDING_GRACE_MS = 2 * 60 * 60 * 1000;

export interface CounterProps {
  hour: number;
  minute: number;
  timeZone: string;
  latestDrawDate: number | null;
}

function Counter({ hour, minute, timeZone, latestDrawDate }: Readonly<CounterProps>) {
  const { colors } = useTheme() as NavigationTheme;
  const styles = useStyles();
  const [timeLeft, setTimeLeft] = useState(() =>
    timeDifference(nextDrawTimestamp(hour, minute, timeZone)),
  );

  useEffect(() => {
    const tick = () => {
      const today = todaysDrawTimestamp(hour, minute, timeZone);
      const next = nextDrawTimestamp(hour, minute, timeZone);
      if (!Number.isFinite(next) || !Number.isFinite(today)) {
        setTimeLeft(null);
        return;
      }
      const now = Date.now();
      const hasTodayResult = latestDrawDate != null && latestDrawDate >= today;
      const inPendingWindow = now >= today && now - today < PENDING_GRACE_MS;
      if (inPendingWindow && !hasTodayResult) {
        setTimeLeft(null);
        return;
      }
      setTimeLeft(timeDifference(next));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [hour, minute, timeZone, latestDrawDate]);

  return (
    <View style={styles.counterBox}>
      <TextDefault textColor={colors.brandAccent} style={styles.leftSide} center bold>
        {"Next Draw"}
      </TextDefault>
      <View style={styles.counterContainer}>
        {timeLeft ? (
          <>
            <View style={styles.timerbox}>
              <TextDefault textColor={colors.headerBackground} small numberOfLines={1}>
                {"Days"}
              </TextDefault>
              <TextDefault textColor={colors.white} center bold numberOfLines={1}>
                {String(timeLeft.days)}
              </TextDefault>
            </View>
            <View style={styles.timerbox}>
              <TextDefault textColor={colors.headerBackground} small numberOfLines={1}>
                {"Hour"}
              </TextDefault>
              <TextDefault textColor={colors.white} center bold numberOfLines={1}>
                {String(timeLeft.hours)}
              </TextDefault>
            </View>
            <View style={styles.timerbox}>
              <TextDefault textColor={colors.headerBackground} small numberOfLines={1}>
                {"Min"}
              </TextDefault>
              <TextDefault textColor={colors.white} center bold numberOfLines={1}>
                {String(timeLeft.minutes)}
              </TextDefault>
            </View>
            <View style={styles.timerbox}>
              <TextDefault textColor={colors.headerBackground} small numberOfLines={1}>
                {"Sec"}
              </TextDefault>
              <TextDefault textColor={colors.white} center bold numberOfLines={1}>
                {String(timeLeft.seconds)}
              </TextDefault>
            </View>
          </>
        ) : (
          <TextDefault textColor={colors.drawerTitleColor} center bold H4>
            {"Pending"}
          </TextDefault>
        )}
      </View>
    </View>
  );
}

export default React.memo(Counter);
