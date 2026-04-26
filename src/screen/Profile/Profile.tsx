import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextDefault } from '../../components/Text';
import { profile } from '../../mock/profile';
import { alignment, colors } from '../../utilities';
import styles from './styles';

function Profile() {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState<string>(profile.name);
  const [nameError, setNameError] = useState<string>('');

  function handleSave() {
    if (!name.trim()) {
      setNameError('Name is required');
      return;
    }
    setNameError('');
    setEditing(false);
  }

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={[styles.flex, styles.backScreen]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.flex, { width: '100%' }]}>
        <ScrollView style={styles.flex} contentContainerStyle={{ flexGrow: 1, alignItems: 'center', paddingBottom: 20 }}>
          <View style={styles.formSubContainer}>
            <View style={styles.containerHeading}>
              <View style={styles.headingTitle}>
                <TextDefault textColor={colors.fontMainColor} bold H5 style={alignment.PLsmall}>
                  {'Contact Info'}
                </TextDefault>
              </View>
              <View style={styles.headingLink}>
                <TouchableOpacity activeOpacity={0.3} style={styles.headingButton} onPress={() => setEditing((prev) => !prev)}>
                  <TextDefault textColor={colors.drawerTitleColor} bold>
                    {editing ? 'Cancel' : 'Edit'}
                  </TextDefault>
                </TouchableOpacity>
              </View>
            </View>

            {!editing ? (
              <View style={styles.containerInfo}>
                <TextDefault textColor={colors.fontSecondColor} bold style={alignment.MBxSmall}>
                  {name}
                </TextDefault>
                <TextDefault textColor={colors.fontSecondColor} bold style={alignment.MBxSmall}>
                  {profile.email}
                </TextDefault>
              </View>
            ) : (
              <View style={styles.containerInfo}>
                <TextDefault textColor={colors.fontSecondColor} small style={styles.inputLabel}>
                  {'Name'}
                </TextDefault>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={(t) => {
                    setName(t);
                    if (nameError) setNameError('');
                  }}
                  maxLength={40}
                  placeholder="Name"
                  placeholderTextColor={colors.fontSecondColor}
                />
                {!!nameError && <TextDefault style={styles.inputError}>{nameError}</TextDefault>}

                <TextDefault textColor={colors.fontSecondColor} small style={styles.inputLabel}>
                  {'Email'}
                </TextDefault>
                <TextInput
                  style={[styles.input, { color: colors.fontSecondColor }]}
                  value={profile.email}
                  editable={false}
                />

                <TouchableOpacity activeOpacity={0.7} style={styles.saveContainer} onPress={handleSave}>
                  <TextDefault textColor={colors.fontWhite} H4 bold>
                    {'Save'}
                  </TextDefault>
                </TouchableOpacity>

                <View style={styles.changePassRow}>
                  <TouchableOpacity activeOpacity={0.7}>
                    <TextDefault textColor={colors.drawerTitleColor} bold>
                      {'Change Password'}
                    </TextDefault>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default React.memo(Profile);
