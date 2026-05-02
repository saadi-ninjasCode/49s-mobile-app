import { FontAwesome5 } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DatePickerField from "../../components/DatePickerField/DatePickerField";
import LotteryCard from "../../components/LotteryCard/LotteryCard";
import { TextDefault, TextError } from "../../components/Text";
import { getDrawsForDrawType } from "../../mock/draws";
import type { DrawWithContext } from "../../types";
import { isSameDay, scale } from "../../utilities";
import { useStyles } from "./styles";

export interface LotteryProps {
  gameId?: string | null;
  drawTypeId?: string | null;
}

const DEFAULT_LIMIT = 5;

function Lottery({ drawTypeId }: LotteryProps) {
  const { colors } = useTheme() as NavigationTheme;
  const styles = useStyles();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    setSelectedDate(null);
  }, [drawTypeId]);

  const allDraws = useMemo(() => getDrawsForDrawType(drawTypeId), [drawTypeId]);

  const handleClear = useCallback(() => setSelectedDate(null), []);

  if (!allDraws.length) {
    return <TextError text={"Data is not available now."} textColor={colors.brandAccent} />;
  }

  const latest: DrawWithContext = allDraws[0];
  const defaultPrevious: DrawWithContext[] = allDraws.slice(1, DEFAULT_LIMIT + 1);
  const isFiltering = selectedDate !== null;

  let filteredDraw: DrawWithContext | null = null;
  if (selectedDate) {
    filteredDraw = allDraws.find((d) => isSameDay(d.date, selectedDate)) ?? null;
  }

  let data: DrawWithContext[];
  if (!isFiltering) {
    data = defaultPrevious;
  } else if (filteredDraw) {
    data = [filteredDraw];
  } else {
    data = [];
  }

  const oldestDate = new Date(allDraws.at(-1)!.date);
  const newestDate = new Date(allDraws[0].date);

  const renderHeader = () => (
    <>
      <View style={styles.filterRow}>
        <DatePickerField
          value={selectedDate}
          onSelect={setSelectedDate}
          placeholder="Filter by date"
          minimumDate={oldestDate}
          maximumDate={newestDate}
        />
        {isFiltering && (
          <Pressable
            onPress={handleClear}
            style={({ pressed }) => [styles.clearButton, pressed && styles.clearButtonPressed]}
          >
            <FontAwesome5 name="times" size={scale(12)} color={colors.brandAccent} />
            <TextDefault textColor={colors.brandAccent} bold>
              {"Clear"}
            </TextDefault>
          </Pressable>
        )}
      </View>

      {!isFiltering && (
        <>
          <TextDefault textColor={colors.headerBackground} H4 center style={styles.headerStyles}>
            {"Latest Result"}
          </TextDefault>
          <LotteryCard {...latest} />
          <View style={styles.separator} />
          <TextDefault textColor={colors.headerBackground} H4 center style={styles.headerStyles}>
            {"Previous Results"}
          </TextDefault>
        </>
      )}

      {isFiltering && (
        <TextDefault textColor={colors.headerBackground} H4 center style={styles.headerStyles}>
          {"Result"}
        </TextDefault>
      )}
    </>
  );

  const renderEmpty = () =>
    isFiltering ? (
      <View style={styles.emptyState}>
        <TextDefault textColor={colors.fontMainColor} H4 bold center>
          {"No draw found for the selected date"}
        </TextDefault>
      </View>
    ) : null;

  return (
    <SafeAreaView edges={["bottom", "left", "right"]} style={styles.flex}>
      <FlatList<DrawWithContext>
        data={data}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item._id}
        style={styles.flex}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={[styles.mainBackground, styles.mainContainer]}
        renderItem={({ item }) => <LotteryCard {...item} />}
      />
    </SafeAreaView>
  );
}

export default React.memo(Lottery);
