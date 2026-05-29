import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';

import { ScanButton } from '@/components/ui/scan-button';
import { Colors, Typography } from '@/constants/theme';
import { useGuardedPress } from '@/utils/press-guard';
import { normalizeHttpUrlInput } from '@/utils/shared-url';

const COMPACT_WIDTH = 380;
const SHORT_SCREEN_HEIGHT = 760;

function getSharedUrlParam(value: string | string[] | undefined): string {
  if (typeof value !== 'string') {
    return '';
  }

  return normalizeHttpUrlInput(value) ?? '';
}

export default function AddLinkScreen() {
  const { sharedUrl } = useLocalSearchParams<{ sharedUrl?: string }>();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const initialSharedUrl = getSharedUrlParam(sharedUrl);
  const [url, setUrl] = useState(initialSharedUrl);
  const [error, setError] = useState('');
  const isCompact = windowWidth < COMPACT_WIDTH || windowHeight <= SHORT_SCREEN_HEIGHT;
  const [isNavigating, setIsNavigating] = useState(false);
  const isNavigatingRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      isNavigatingRef.current = false;
      setIsNavigating(false);
    }, []),
  );

  useEffect(() => {
    const nextSharedUrl = getSharedUrlParam(sharedUrl);

    if (!nextSharedUrl) {
      return;
    }

    setUrl(nextSharedUrl);
    setError('');
  }, [sharedUrl]);

  const handleScan = () => {
    if (isNavigatingRef.current) {
      return;
    }

    const trimmed = url.trim();

    if (!trimmed) {
      setError('URL을 입력해주세요.');
      return;
    }

    // 1단계: new URL()로 형식 검증
    const normalizedUrl = normalizeHttpUrlInput(trimmed);

    if (!normalizedUrl) {
      setError('올바르지 않은 URL 입력입니다.');
      return;
    }

    setError('');
    isNavigatingRef.current = true;
    setIsNavigating(true);
    router.push({ pathname: '/(tabs)/(home)/scanning', params: { url: normalizedUrl } });
  };

  const handleChangeUrl = (value: string) => {
    setUrl(value);
    if (error) setError('');
  };

  const hasError = error.length > 0;
  const scanDisabled = !url.trim() || isNavigating;
  const guardedClearUrl = useGuardedPress(() => {
    setUrl('');
    setError('');
  }, { lockMs: 250 });

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
          <View style={[styles.container, isCompact && styles.containerCompact]}>
            {/* 타이틀 */}
            <View style={[styles.titleRow, isCompact && styles.titleRowCompact]}>
              <Text style={[styles.titleGreen, isCompact && styles.titleCompact]}>링크를</Text>
              <Text style={[styles.titleDark, isCompact && styles.titleCompact]}> 입력해주세요</Text>
            </View>

            {/* 부제목 */}
            <Text style={[styles.subtitle, isCompact && styles.subtitleCompact]}>
              보안검사 후 저장할 수 있습니다.
            </Text>

            {/* URL 입력 + 검사 버튼 */}
            <View style={[styles.inputRow, isCompact && styles.inputRowCompact]}>
              <View style={[styles.inputWrapper, isCompact && styles.inputWrapperCompact, hasError && styles.inputError]}>
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
                />
                {url.length > 0 && (
                  <TouchableOpacity
                    onPress={guardedClearUrl}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={styles.clearButton}
                  >
                    <Text style={styles.clearButtonText}>−</Text>
                  </TouchableOpacity>
                )}
              </View>
              <ScanButton onPress={handleScan} disabled={scanDisabled} />
            </View>

            {/* 에러 메시지 */}
            {hasError && <Text style={[styles.errorText, isCompact && styles.errorTextCompact]}>{error}</Text>}

            {/* 안내 박스 */}
            <View style={[styles.infoBox, isCompact && styles.infoBoxCompact]}>
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
  containerCompact: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },

  // 타이틀
  titleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  titleRowCompact: {
    marginBottom: 8,
  },
  titleGreen: {
    ...Typography.display,
    color: Colors.brand.primaryDeep,
  },
  titleDark: {
    ...Typography.display,
    color: Colors.brand.text,
  },
  titleCompact: {
    ...Typography.pageTitle,
  },

  // 부제목
  subtitle: {
    ...Typography.body,
    color: Colors.brand.textSecondary,
    marginBottom: 32,
  },
  subtitleCompact: {
    ...Typography.summary,
    marginBottom: 24,
  },

  // 입력 행
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  inputRowCompact: {
    gap: 6,
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
  inputWrapperCompact: {
    height: 56,
    paddingHorizontal: 14,
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
  // 에러
  errorText: {
    ...Typography.body,
    color: Colors.brand.textWarning,
    marginBottom: 16,
  },
  errorTextCompact: {
    ...Typography.summary,
    marginBottom: 12,
  },

  // 안내 박스
  infoBox: {
    backgroundColor: Colors.brand.softMint,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    gap: 6,
  },
  infoBoxCompact: {
    padding: 14,
    marginTop: 12,
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
