import { FontAwesome5 } from "@expo/vector-icons";
import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useTheme } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import { Modal, Platform, Pressable, View } from "react-native";
import { scale } from "../../utilities";
import { dateWithWeekday } from "../../utilities/date";
import { TextDefault } from "../Text";
import { useStyles } from "./styles";

export interface DatePickerFieldProps {
  value: Date | null;
  onSelect: (date: Date) => void;
  placeholder?: string;
  maximumDate?: Date;
  minimumDate?: Date;
}

function DatePickerField({
  value,
  onSelect,
  placeholder = "Select date",
  maximumDate,
  minimumDate,
}: DatePickerFieldProps) {
  const theme = useTheme() as NavigationTheme;
  const { colors } = theme;
  const styles = useStyles();
  const [open, setOpen] = useState(false);
  const [staged, setStaged] = useState<Date>(value ?? new Date());

  const openPicker = useCallback(() => {
    setStaged(value ?? new Date());
    setOpen(true);
  }, [value]);

  const handleAndroidChange = useCallback(
    (event: DateTimePickerEvent, picked?: Date) => {
      setOpen(false);
      if (event.type === "set" && picked) {
        onSelect(picked);
      }
    },
    [onSelect],
  );

  const handleIOSChange = useCallback((_: DateTimePickerEvent, picked?: Date) => {
    if (picked) setStaged(picked);
  }, []);

  const handleCancel = useCallback(() => setOpen(false), []);
  const handleDone = useCallback(() => {
    setOpen(false);
    onSelect(staged);
  }, [onSelect, staged]);

  const label = value ? dateWithWeekday(value.getTime()) : placeholder;
  const labelColor = value ? colors.fontMainColor : colors.fontSecondColor;

  return (
    <>
      <Pressable onPress={openPicker} style={styles.field}>
        <TextDefault textColor={labelColor} style={styles.fieldText} numberOfLines={1}>
          {label}
        </TextDefault>
        <FontAwesome5 name="calendar-alt" size={scale(16)} color={colors.brandAccent} />
      </Pressable>

      {Platform.OS === "android" && open && (
        <DateTimePicker
          value={value ?? new Date()}
          mode="date"
          display="default"
          onChange={handleAndroidChange}
          maximumDate={maximumDate}
          minimumDate={minimumDate}
        />
      )}

      {Platform.OS === "ios" && (
        <Modal
          visible={open}
          transparent
          animationType="slide"
          onRequestClose={handleCancel}
        >
          <Pressable style={styles.modalBackdrop} onPress={handleCancel}>
            <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalHeader}>
                <Pressable
                  onPress={handleCancel}
                  style={({ pressed }) => [styles.modalButton, pressed && styles.modalButtonPressed]}
                >
                  <TextDefault textColor={colors.fontSecondColor} bold>
                    {"Cancel"}
                  </TextDefault>
                </Pressable>
                <Pressable
                  onPress={handleDone}
                  style={({ pressed }) => [styles.modalButton, pressed && styles.modalButtonPressed]}
                >
                  <TextDefault textColor={colors.brandAccent} bold>
                    {"Done"}
                  </TextDefault>
                </Pressable>
              </View>
              <View style={styles.spinnerWrapper}>
                <DateTimePicker
                  value={staged}
                  mode="date"
                  display="spinner"
                  onChange={handleIOSChange}
                  maximumDate={maximumDate}
                  minimumDate={minimumDate}
                  themeVariant={theme.dark ? "dark" : "light"}
                />
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </>
  );
}

export default React.memo(DatePickerField);
