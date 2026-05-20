import { useTheme } from '@react-navigation/native';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextDefault } from '../../components/Text';
import { alignment } from '../../utilities';
import { PRIVACY_SECTIONS } from './content';
import { useStyles } from './styles';

function Privacy() {
  const { colors } = useTheme() as NavigationTheme;
  const styles = useStyles();
  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.flex}>
      <ScrollView
        style={[styles.flex, styles.mainBackground]}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={alignment.PBlarge}>
          {PRIVACY_SECTIONS.map((section) => (
            <View key={section.title}>
              <TextDefault
                textColor={colors.brandAccent}
                H3
                bold
                center
                style={alignment.MBsmall}
              >
                {section.title}
              </TextDefault>
              <TextDefault textColor={colors.fontMainColor} style={styles.textAlignment}>
                {section.body}
              </TextDefault>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default React.memo(Privacy);
