import { StyleSheet, type TextStyle } from 'react-native';

const color = (textColor: string) =>
  StyleSheet.create({
    color: {
      color: textColor,
    } as TextStyle,
  });

export default color;
