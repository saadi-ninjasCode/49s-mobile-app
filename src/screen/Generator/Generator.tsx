import { useTheme } from "@react-navigation/native";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, Switch, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TextDefault } from "../../components/Text";
import { randomBalls } from "../../utilities/lottery";
import { useStyles } from "./styles";

type BallValue = number | "?";
type Mode = "luckyDip" | "pick3";
type Styles = ReturnType<typeof useStyles>;

const PICK_3_COUNT = 3;
const SPIN_INTERVAL_MS = 50;
const SPIN_DURATION_MS = 2000;
const COUNT_OPTIONS = [1, 2, 3, 4, 5] as const;
const MAX_SLOTS = 7;

function placeholders(count: number): BallValue[] {
  return Array.from({ length: count }, () => "?");
}

interface TabPillProps {
  mode: Mode;
  active: boolean;
  disabled: boolean;
  label: string;
  activeColor: string;
  inactiveColor: string;
  styles: Styles;
  onSelect: (mode: Mode) => void;
}

const TabPill = React.memo(function TabPill({
  mode,
  active,
  disabled,
  label,
  activeColor,
  inactiveColor,
  styles,
  onSelect,
}: TabPillProps) {
  const handlePress = useCallback(() => onSelect(mode), [onSelect, mode]);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active, disabled }}
      disabled={disabled}
      onPress={handlePress}
      style={[styles.tabPill, active && styles.tabPillActive]}
    >
      <TextDefault textColor={active ? activeColor : inactiveColor} bold center>
        {label}
      </TextDefault>
    </Pressable>
  );
});

interface CountPillProps {
  value: number;
  active: boolean;
  disabled: boolean;
  activeColor: string;
  inactiveColor: string;
  styles: Styles;
  onSelect: (value: number) => void;
}

const CountPill = React.memo(function CountPill({
  value,
  active,
  disabled,
  activeColor,
  inactiveColor,
  styles,
  onSelect,
}: CountPillProps) {
  const handlePress = useCallback(() => onSelect(value), [onSelect, value]);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active, disabled }}
      disabled={disabled}
      onPress={handlePress}
      style={[styles.countPill, active && styles.countPillActive]}
    >
      <TextDefault textColor={active ? activeColor : inactiveColor} bold>
        {value}
      </TextDefault>
    </Pressable>
  );
});

function Generator() {
  const { colors } = useTheme() as NavigationTheme;
  const styles = useStyles();

  const [mode, setMode] = useState<Mode>("luckyDip");
  const [mainCount, setMainCount] = useState<number>(5);
  const [includeBooster, setIncludeBooster] = useState<boolean>(true);
  const [mainBalls, setMainBalls] = useState<BallValue[]>(placeholders(5));
  const [booster, setBooster] = useState<BallValue | null>("?");
  const [isGenerating, setIsGenerating] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const slotIds = useMemo(
    () => Array.from({ length: MAX_SLOTS }, (_, i) => `slot-${i}-${Math.random().toString(36).slice(2, 8)}`),
    [],
  );

  const { count, withBooster } = useMemo(() => {
    if (mode === "pick3") return { count: PICK_3_COUNT, withBooster: false };
    return { count: mainCount, withBooster: includeBooster };
  }, [mode, mainCount, includeBooster]);

  useEffect(() => {
    setMainBalls(placeholders(count));
    setBooster(withBooster ? "?" : null);
  }, [count, withBooster]);

  useEffect(
    () => () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    [],
  );

  const drawOnce = useCallback(() => {
    const total = withBooster ? count + 1 : count;
    const numbers = randomBalls(total);
    if (withBooster) {
      setMainBalls(numbers.slice(0, count));
      setBooster(numbers.at(-1) ?? "?");
    } else {
      setMainBalls(numbers);
      setBooster(null);
    }
  }, [count, withBooster]);

  const generate = useCallback(() => {
    if (isGenerating) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsGenerating(true);
    intervalRef.current = setInterval(drawOnce, SPIN_INTERVAL_MS);
    timeoutRef.current = setTimeout(() => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      drawOnce();
      setIsGenerating(false);
    }, SPIN_DURATION_MS);
  }, [drawOnce, isGenerating]);

  const onSelectMode = useCallback(
    (next: Mode) => {
      if (isGenerating || next === mode) return;
      setMode(next);
    },
    [isGenerating, mode],
  );

  const onSelectCount = useCallback(
    (next: number) => {
      if (isGenerating) return;
      setMainCount(next);
    },
    [isGenerating],
  );

  return (
    <SafeAreaView style={[styles.flex, styles.mainBackground]}>
      <View style={styles.box}>
        <View style={styles.header}>
          <TextDefault textColor={colors.headerBackground} H4 bold center>
            {"Number Generator"}
          </TextDefault>
        </View>
        <View style={styles.boxContainer}>
          <View style={styles.boxInfo}>
            <View style={styles.tabBar}>
              <TabPill
                mode="luckyDip"
                active={mode === "luckyDip"}
                disabled={isGenerating}
                label="Lucky Dip"
                activeColor={colors.headerBackground}
                inactiveColor={colors.fontWhite}
                styles={styles}
                onSelect={onSelectMode}
              />
              <TabPill
                mode="pick3"
                active={mode === "pick3"}
                disabled={isGenerating}
                label="Pick 3"
                activeColor={colors.headerBackground}
                inactiveColor={colors.fontWhite}
                styles={styles}
                onSelect={onSelectMode}
              />
            </View>

            {mode === "luckyDip" ? (
              <View style={styles.controls}>
                <TextDefault textColor={colors.fontWhite} small style={styles.controlsLabel}>
                  {"Select how many main numbers to generate:"}
                </TextDefault>
                <View style={styles.countRow}>
                  {COUNT_OPTIONS.map((n) => (
                    <CountPill
                      key={n}
                      value={n}
                      active={n === mainCount}
                      disabled={isGenerating}
                      activeColor={colors.headerBackground}
                      inactiveColor={colors.fontWhite}
                      styles={styles}
                      onSelect={onSelectCount}
                    />
                  ))}
                </View>
                <View style={styles.switchRow}>
                  <TextDefault textColor={colors.fontWhite} small>
                    {"Include Booster Ball"}
                  </TextDefault>
                  <Switch value={includeBooster} onValueChange={setIncludeBooster} disabled={isGenerating} />
                </View>
              </View>
            ) : (
              <View style={styles.controls}>
                <TextDefault textColor={colors.fontWhite} small center style={styles.controlsLabel}>
                  {"3 unique numbers will be generated."}
                </TextDefault>
              </View>
            )}

            <View style={styles.lotteryBalls}>
              {mainBalls.map((value, index) => (
                <View style={styles.ballContainer} key={slotIds[index]}>
                  <TextDefault textColor={colors.headerBackground} bold H4 center>
                    {value}
                  </TextDefault>
                </View>
              ))}
              {booster !== null && (
                <>
                  <View style={styles.boosterDivider} />
                  <View style={styles.boosterBallContainer}>
                    <TextDefault textColor={colors.fontWhite} bold H4 center>
                      {booster}
                    </TextDefault>
                  </View>
                </>
              )}
            </View>

            <TouchableOpacity
              style={[styles.btn, isGenerating && styles.btnDisabled]}
              onPress={generate}
              activeOpacity={0.7}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <TextDefault textColor={colors.white} H4 bold>
                  {"Generate"}
                </TextDefault>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

export default React.memo(Generator);
