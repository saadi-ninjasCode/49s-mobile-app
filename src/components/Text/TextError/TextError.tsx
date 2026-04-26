import { useTheme } from '@react-navigation/native';
import React from 'react';
import { View } from 'react-native';
import TextDefault from '../TextDefault/TextDefault';

export interface TextErrorProps {
  text: string;
  textColor?: string;
  mainColor?: string;
}

function TextError(props: TextErrorProps) {
  const { colors } = useTheme() as NavigationTheme;
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: props.mainColor ?? colors.mainBackground,
      }}>
      <TextDefault textColor={props.textColor ?? colors.fontMainColor} bold H5 center>
        {props.text}{' '}
      </TextDefault>
    </View>
  );
}

export default React.memo(TextError);
