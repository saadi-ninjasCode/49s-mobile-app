import { useTheme } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { TextDefault } from '../../components/Text';
import { alignment } from '../../utilities';

export interface StubProps {
  title: string;
  subtitle?: string;
}

function Stub({ title, subtitle }: StubProps) {
  const { colors } = useTheme() as NavigationTheme;
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.mainBackground,
      padding: 24,
    },
  });
  return (
    <View style={styles.container}>
      <TextDefault textColor={colors.brandAccent} H2 bold center>
        {title}
      </TextDefault>
      {subtitle ? (
        <TextDefault textColor={colors.fontSecondColor} H5 center style={alignment.MTsmall}>
          {subtitle}
        </TextDefault>
      ) : null}
      <TextDefault textColor={colors.fontSecondColor} small center style={alignment.MTlarge}>
        {'(Mock screen — UI to be ported)'}
      </TextDefault>
    </View>
  );
}

export default React.memo(Stub);
