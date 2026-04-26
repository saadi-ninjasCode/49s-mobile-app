import React from 'react';
import { StyleSheet, Text, type StyleProp, type TextStyle } from 'react-native';
import { textStyles } from '../../../utilities';
import color from './styles';

export interface TextDefaultProps {
  textColor?: string;
  bold?: boolean;
  center?: boolean;
  right?: boolean;
  small?: boolean;
  H1?: boolean;
  H2?: boolean;
  H3?: boolean;
  H4?: boolean;
  H5?: boolean;
  uppercase?: boolean;
  lineOver?: boolean;
  numberOfLines?: number;
  style?: StyleProp<TextStyle>;
  children: React.ReactNode;
}

function TextDefault(props: TextDefaultProps) {
  const textColor = props.textColor ?? 'black';
  const defaultStyle: TextStyle = StyleSheet.flatten([
    color(textColor).color,
    textStyles.Normal,
  ]);
  const customStyles: StyleProp<TextStyle>[] = [defaultStyle];

  if (props.bold) customStyles.push(textStyles.Bold as TextStyle);
  if (props.center) customStyles.push(textStyles.Center as TextStyle);
  if (props.right) customStyles.push(textStyles.Right as TextStyle);
  if (props.small) customStyles.push(textStyles.Small);
  if (props.H5) customStyles.push(textStyles.H5);
  if (props.H4) customStyles.push(textStyles.H4);
  if (props.H3) customStyles.push(textStyles.H3);
  if (props.H2) customStyles.push(textStyles.H2);
  if (props.H1) customStyles.push(textStyles.H1);
  if (props.uppercase) customStyles.push(textStyles.UpperCase as TextStyle);
  if (props.lineOver) customStyles.push(textStyles.LineOver as TextStyle);

  const flat = StyleSheet.flatten([customStyles, props.style]);
  return (
    <Text numberOfLines={props.numberOfLines ?? 0} style={flat}>
      {props.children}
    </Text>
  );
}

export default React.memo(TextDefault);
