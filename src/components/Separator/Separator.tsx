import React from "react";
import { View } from "react-native";
import { useStyles } from "./styles";

function Separator() {
  const styles = useStyles();
  return <View style={styles.separator} />;
}

export default React.memo(Separator);
