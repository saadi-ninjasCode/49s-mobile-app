import { FontAwesome5 } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import { FlatList, ListRenderItem, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DatePickerField from "../../components/DatePickerField/DatePickerField";
import DrawCard from "../../components/DrawCard/DrawCard";
import { TextDefault, TextError } from "../../components/Text";
import { subscribeDrawsForDrawType } from "../../services/firestore";
import { scale } from "../../utilities";
import { useStyles } from "./styles";

export interface DrawProps {
  gameId?: string | null;
  drawTypeId?: string | null;
}

const DEFAULT_LIMIT = 5;

function Draw({ drawTypeId }: DrawProps) {
  const { colors } = useTheme() as NavigationTheme;
  const styles = useStyles();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [allDraws, setAllDraws] = useState<DrawWithContext[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSelectedDate(null);
  }, [drawTypeId]);

  useEffect(() => {
    if (!drawTypeId) {
      setAllDraws([]);
      setLoading(false);
      return;
    }
    setAllDraws([]);
    setLoading(true);
    return subscribeDrawsForDrawType(
      drawTypeId,
      (draws) => {
        setAllDraws(draws);
        setLoading(false);
      },
      { date: selectedDate },
    );
  }, [drawTypeId, selectedDate]);

  const handleClear = useCallback(() => setSelectedDate(null), []);

  const isFiltering = selectedDate !== null;

  if (!loading && !isFiltering && allDraws.length === 0) {
    return <TextError text={"Data is not available now."} textColor={colors.brandAccent} />;
  }

  // const latest: DrawWithContext | null = isFiltering ? null : (allDraws[0] ?? null);
  const defaultPrevious: DrawWithContext[] = isFiltering ? [] : allDraws.slice(1, DEFAULT_LIMIT + 1);

  const data: DrawWithContext[] = isFiltering ? allDraws : defaultPrevious;

  const renderHeader = () => (
    <>
      <View style={styles.filterRow}>
        <DatePickerField
          value={selectedDate}
          onSelect={setSelectedDate}
          placeholder="Filter by date"
          maximumDate={new Date()}
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

      {/* {!isFiltering && latest && (
        <>
          <TextDefault textColor={colors.brandAccent} H4 center style={styles.headerStyles}>
            {"Latest Result"}
          </TextDefault>
          <DrawCard {...latest} />
          <View style={styles.separator} />
          <TextDefault textColor={colors.brandAccent} H4 center style={styles.headerStyles}>
            {"Previous Results"}
          </TextDefault>
        </>
      )}

      {isFiltering && data.length > 0 && (
        <TextDefault textColor={colors.brandAccent} H4 center style={styles.headerStyles}>
          {"Result"}
        </TextDefault>
      )} */}
    </>
  );

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.emptyState}>
          <TextDefault textColor={colors.fontMainColor} H4 bold center>
            {"Loading…"}
          </TextDefault>
        </View>
      );
    }
    return (
      <View style={styles.emptyState}>
        <TextDefault textColor={colors.fontMainColor} H4 bold center>
          {"No draw result found"}
        </TextDefault>
      </View>
    );
  };

  const renderList: ListRenderItem<DrawWithContext> = ({ item, index }) => {
    let renderArray = [];
    if (index === 0 && allDraws.length === 1) {
      renderArray.push(
        <TextDefault key={"title"} textColor={colors.brandAccent} H4 center style={styles.headerStyles}>
          {"Results"}
        </TextDefault>,
      );
    } else if (index === 0 && allDraws.length > 1) {
      renderArray.push(
        <TextDefault key={"latest_title"} textColor={colors.brandAccent} H4 center style={styles.headerStyles}>
          {"Latest Result"}
        </TextDefault>,
      );
    } else if (index === 1 && allDraws.length > 2) {
      renderArray.push(
        <TextDefault key={"prev_title"} textColor={colors.brandAccent} H4 center style={styles.headerStyles}>
          {"Previous Results"}
        </TextDefault>,
      );
    }

    return (
      <>
        {renderArray}
        <DrawCard {...item} />
      </>
    );
  };

  return (
    <SafeAreaView edges={["bottom", "left", "right"]} style={styles.flex}>
      <FlatList<DrawWithContext>
        data={allDraws}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item._id}
        style={styles.flex}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={[styles.mainBackground, styles.mainContainer]}
        renderItem={renderList}
      />
    </SafeAreaView>
  );
}

export default React.memo(Draw);
