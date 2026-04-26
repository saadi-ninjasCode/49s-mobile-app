import { FontAwesome5 } from "@expo/vector-icons";
import { DrawerItem } from "@react-navigation/drawer";
import { useTheme } from "@react-navigation/native";
import React from "react";
import { scale } from "../../../utilities";
import { TextDefault } from "../../Text";
import styles from "./styles";

type FontAwesome5Glyph = React.ComponentProps<typeof FontAwesome5>["name"];

export interface DrawerItemsProps {
  name?: string;
  icon: string;
  text: string;
  active?: boolean;
  onPress: () => void;
}

function DrawerItems(props: DrawerItemsProps) {
  const { colors } = useTheme() as NavigationTheme;
  const isActive = props.active === true;
  return (
    <DrawerItem
      inactiveTintColor={colors.fontWhite}
      activeTintColor={colors.fontWhite}
      style={[
        { marginVertical: 0, backgroundColor: "transparent" },
        isActive && { backgroundColor: colors.drawerSelected },
      ]}
      onPress={props.onPress}
      label={({ color }) => (
        <TextDefault style={styles.font} textColor={color}>
          {" "}
          {props.text}
        </TextDefault>
      )}
      icon={({ color }) => <FontAwesome5 name={props.icon as FontAwesome5Glyph} size={scale(15)} color={color} />}
    />
  );
}

export default DrawerItems;
