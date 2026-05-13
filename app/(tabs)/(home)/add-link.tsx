import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Stack, router } from 'expo-router';

import { ScanButton } from '@/components/ui/scan-button';
import { Colors, Typography } from '@/constants/theme';

function isValidUrlFormat(value: string): boolean {
  const trimmed = value.trim();
  if (!/^https?:\/\//i.test(trimmed)) return false;
  try {
    const parsed = new URL(trimmed);
    const parts = parsed.hostname.split('.');
    const tld = parts[parts.length - 1];
    return parts.length >= 2 && tld.length >= 2;
  } catch {
    return false;
  }
}

export default function AddLinkScreen() {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [isChecking, setIsChecking] = useState(false);

  const handleScan = async () => {
    const trimmed = url.trim();

    if (!trimmed) {
      setError('URL을 입력해주세요.');
      return;
    }

    // 1단계: new URL()로 형식 검증
    if (!isValidUrlFormat(trimmed)) {
      setError('올바르지 않은 URL 입력입니다.');
      return;
    }

    // 2단계: Linking.canOpenURL()로 실제 열기 가능 여부 확인
    setIsChecking(true);
    try {
      const canOpen = await Linking.canOpenURL(trimmed);
      if (!canOpen) {
        setError('올바르지 않은 URL 입력입니다.');
        return;
      }
      setError('');
      router.push({ pathname: '/(tabs)/(home)/scanning', params: { url: trimmed } });
    } catch {
      setError('URL 확인 중 오류가 발생했습니다.');
    } finally {
      setIsChecking(false);
    }
  };

  const handleChangeUrl = (value: string) => {
    setUrl(value);
    if (error) setError('');
  };

  const hasError = error.length > 0;
  const scanDisabled = !url.trim() || isChecking;

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: '링크 추가',
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
            {/* 타이틀 */}
            <View style={styles.titleRow}>
              <Text style={styles.titleGreen}>링크를</Text>
              <Text style={styles.titleDark}> 입력해주세요</Text>
            </View>

            {/* 부제목 */}
            <Text style={styles.subtitle}>보안검사 후 저장할 수 있습니다.</Text>

            {/* URL 입력 + 검사 버튼 */}
            <View style={styles.inputRow}>
              <View style={[styles.inputWrapper, hasError && styles.inputError]}>
                <TextInput
                  style={styles.input}
                  placeholder="https://example.com"
                  placeholderTextColor={Colors.brand.textHint}
                  value={url}
                  onChangeText={handleChangeUrl}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                  returnKeyType="search"
                  onSubmitEditing={handleScan}
                  editable={!isChecking}
                />
                {url.length > 0 && !isChecking && (
                  <TouchableOpacity
                    onPress={() => { setUrl(''); setError(''); }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={styles.clearButton}
                  >
                    <Text style={styles.clearButtonText}>−</Text>
                  </TouchableOpacity>
                )}
              </View>
              {isChecking ? (
                <View style={styles.loadingBox}>
                  <ActivityIndicator size="small" color={Colors.brand.primary} />
                </View>
              ) : (
                <ScanButton onPress={handleScan} disabled={scanDisabled} />
              )}
            </View>

            {/* 에러 메시지 */}
            {hasError && <Text style={styles.errorText}>{error}</Text>}

            {/* 안내 박스 */}
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>안내</Text>
              <Text style={styles.infoBody}>
                검사 후 안전한 사이트이라면, 저장하실 수 있습니다.
              </Text>
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

  // 타이틀
  titleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  titleGreen: {
    ...Typography.display,
    color: Colors.brand.primaryDeep,
  },
  titleDark: {
    ...Typography.display,
    color: Colors.brand.text,
  },

  // 부제목
  subtitle: {
    ...Typography.body,
    color: Colors.brand.textSecondary,
    marginBottom: 32,
  },

  // 입력 행
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.brand.line,
    backgroundColor: Colors.brand.surface,
    paddingHorizontal: 16,
  },
  inputError: {
    borderColor: Colors.brand.textWarning,
  },
  input: {
    flex: 1,
    ...Typography.body,
    color: Colors.brand.text,
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
  loadingBox: {
    width: 60,
    height: 60,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.brand.line,
    backgroundColor: Colors.brand.background,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 에러
  errorText: {
    ...Typography.body,
    color: Colors.brand.textWarning,
    marginBottom: 16,
  },

  // 안내 박스
  infoBox: {
    backgroundColor: Colors.brand.softMint,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    gap: 6,
  },
  infoLabel: {
    ...Typography.caption,
    color: Colors.brand.primaryDeep,
  },
  infoBody: {
    ...Typography.summary,
    color: Colors.brand.textSecondary,
  },
});
