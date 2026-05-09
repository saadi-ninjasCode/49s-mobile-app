import { FontAwesome5 } from "@expo/vector-icons";
import { DrawerItem } from "@react-navigation/drawer";
import { useTheme } from "@react-navigation/native";
import React from "react";
import { scale } from "../../utilities";
import { TextDefault } from "../Text";
import { useStyles } from "./styles";

type FontAwesome5Glyph = React.ComponentProps<typeof FontAwesome5>["name"];

function DrawerItems(props: DrawerItemsProps) {
  const { colors } = useTheme() as NavigationTheme;
  const styles = useStyles();
  const isActive = props.active === true;
  return (
    <DrawerItem
      inactiveTintColor={colors.fontWhite}
      activeTintColor={colors.fontWhite}
      style={[
        styles.itemBase,
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
