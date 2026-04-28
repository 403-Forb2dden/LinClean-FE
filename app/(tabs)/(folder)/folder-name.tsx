import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, Stack } from 'expo-router';

import { Button } from '@/components/ui/button';
import { Colors, Typography } from '@/constants/theme';

export default function FolderNameScreen() {
  const [folderName, setFolderName] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const canProceed = folderName.trim().length > 0;

  const handleNext = () => {
    router.push({
      pathname: '/(tabs)/(folder)/folder-url-select',
      params: { folderName: folderName.trim() },
    });
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: '새 폴더 만들기',
          headerBackTitle: '',
          headerTransparent: false,
          headerStyle: { backgroundColor: Colors.brand.background },
          headerTitleStyle: {
            ...Typography.title,
            color: Colors.brand.text,
          },
          headerTintColor: Colors.brand.text,
          headerShadowVisible: false,
        }}
      />
      <View style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.container}>
            <Text style={styles.subtitle}>먼저 폴더 이름을 정해주세요</Text>

            <View style={styles.card}>
              <Text style={styles.fieldLabel}>폴더 이름</Text>
              <View style={[styles.inputRow, isFocused && styles.inputRowFocused]}>
                <TextInput
                  style={styles.input}
                  value={folderName}
                  onChangeText={setFolderName}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="폴더 이름 입력"
                  placeholderTextColor={Colors.brand.textHint}
                  returnKeyType="done"
                  maxLength={50}
                  autoFocus
                />
                {folderName.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setFolderName('')}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={styles.clearButton}
                  >
                    <Text style={styles.clearButtonText}>−</Text>
                  </TouchableOpacity>
                )}
              </View>
              <Text style={styles.helperText}>
                {'이 이름으로 폴더가 생성되고,\n다음 단계에서 URL을 고를 수 있어요.'}
              </Text>
            </View>

            <View style={styles.buttonArea}>
              <Button
                label="다음"
                variant="primary"
                size="large"
                disabled={!canProceed}
                onPress={handleNext}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.brand.background,
  },
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  subtitle: {
    ...Typography.summary,
    color: Colors.brand.textSecondary,
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  fieldLabel: {
    ...Typography.caption,
    color: Colors.brand.textSecondary,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.brand.line,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputRowFocused: {
    borderColor: Colors.brand.primary,
  },
  input: {
    flex: 1,
    ...Typography.section,
    color: Colors.brand.text,
    padding: 0,
  },
  clearButton: {
    marginLeft: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.brand.softMint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButtonText: {
    ...Typography.caption,
    color: Colors.brand.primary,
    lineHeight: 16,
  },
  helperText: {
    ...Typography.caption,
    fontWeight: '400',
    color: Colors.brand.textSecondary,
    lineHeight: 20,
  },
  buttonArea: {
    marginTop: 32,
  },
});
