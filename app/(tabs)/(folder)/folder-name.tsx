import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
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
import { useFolders } from '@/context/folders-context';
import { useGuardedPress } from '@/utils/press-guard';

export default function FolderNameScreen() {
  const [folderName, setFolderName] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isNavigating, setIsNavigating] = useState(false);
  const isNavigatingRef = useRef(false);
  const { folders } = useFolders();

  useFocusEffect(
    useCallback(() => {
      isNavigatingRef.current = false;
      setIsNavigating(false);
    }, []),
  );

  const canProceed = folderName.trim().length > 0 && !isNavigating;

  const handleNext = () => {
    if (isNavigatingRef.current) {
      return;
    }

    const trimmedName = folderName.trim();
    const hasDuplicateName = folders.some(
      (folder) => normalizeFolderName(folder.name) === normalizeFolderName(trimmedName),
    );

    if (hasDuplicateName) {
      setErrorMessage('이미 같은 이름의 폴더가 있어요.');
      return;
    }

    setErrorMessage('');
    isNavigatingRef.current = true;
    setIsNavigating(true);
    router.push({
      pathname: '/(tabs)/(folder)/folder-url-select',
      params: { folderName: trimmedName },
    });
  };
  const guardedClearFolderName = useGuardedPress(() => setFolderName(''), { lockMs: 250 });

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
                  onChangeText={(value) => {
                    setFolderName(value);
                    if (errorMessage) {
                      setErrorMessage('');
                    }
                  }}
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
                    onPress={guardedClearFolderName}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={styles.clearButton}
                  >
                    <Text style={styles.clearButtonText}>−</Text>
                  </TouchableOpacity>
                )}
              </View>
              {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
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
    backgroundColor: Colors.brand.surface,
    borderRadius: 16,
    padding: 20,
    gap: 12,
    shadowColor: Colors.brand.shadow,
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
  errorText: {
    ...Typography.caption,
    color: Colors.brand.textWarning,
  },
  buttonArea: {
    marginTop: 32,
  },
});

function normalizeFolderName(name: string) {
  return name.trim().toLocaleLowerCase();
}
