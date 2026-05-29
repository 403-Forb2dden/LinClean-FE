import { useAuth } from '@clerk/expo';
import LottieView from 'lottie-react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

import { fetchAnalysis, requestAnalysis, type AnalysisResponse, type AnalysisVerdict } from '@/api/analyses';
import { ApiError } from '@/api/api-client';
import { Colors, Typography } from '@/constants/theme';
import { useGuardedPress } from '@/utils/press-guard';

const POLLING_INTERVAL_MS = 2_000;
const MAX_POLLING_MS = 30_000;
const SHORT_SCREEN_HEIGHT = 760;
const VERY_SHORT_SCREEN_HEIGHT = 700;
const DEFAULT_ANIMATION_SIZE = 280;
const SHORT_ANIMATION_SIZE = 216;
const VERY_SHORT_ANIMATION_SIZE = 188;

export default function ScanningScreen() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { url: urlParam } = useLocalSearchParams<{ url?: string | string[] }>();
  const url = getUrlParam(urlParam);
  const { height: windowHeight } = useWindowDimensions();
  const tabBarHeight = useBottomTabBarHeight();
  const [errorMessage, setErrorMessage] = useState('');
  const [retryKey, setRetryKey] = useState(0);
  const getTokenRef = useRef(getToken);
  const isShortScreen = windowHeight <= SHORT_SCREEN_HEIGHT;
  const isVeryShortScreen = windowHeight <= VERY_SHORT_SCREEN_HEIGHT;
  const animationSize = isVeryShortScreen
    ? VERY_SHORT_ANIMATION_SIZE
    : isShortScreen
      ? SHORT_ANIMATION_SIZE
      : DEFAULT_ANIMATION_SIZE;

  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  useEffect(() => {
    const abortController = new AbortController();
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let timedOut = false;

    if (!isLoaded) {
      return () => abortController.abort();
    }

    if (!isSignedIn) {
      setErrorMessage('로그인 상태를 확인할 수 없습니다. 다시 로그인한 뒤 시도해주세요.');
      return () => abortController.abort();
    }

    if (!url) {
      setErrorMessage('검사할 URL을 찾을 수 없습니다. 링크를 다시 입력해주세요.');
      return () => abortController.abort();
    }

    setErrorMessage('');

    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        timedOut = true;
        abortController.abort();
        reject(new Error('TIMEOUT'));
      }, MAX_POLLING_MS);
    });

    Promise.race([
      runAnalysisPolling({
        getToken: () => getTokenRef.current(),
        url,
        signal: abortController.signal,
      }),
      timeoutPromise,
    ])
      .catch((error) => {
        if (timedOut) {
          setErrorMessage(getAnalysisErrorMessage(new Error('TIMEOUT')));
          return;
        }

        if (isAbortError(error)) {
          return;
        }

        setErrorMessage(getAnalysisErrorMessage(error));
      })
      .finally(() => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      });

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      abortController.abort();
    };
  }, [isLoaded, isSignedIn, retryKey, url]);

  const hasError = errorMessage.length > 0;
  const guardedRetry = useGuardedPress(() => setRetryKey((key) => key + 1));
  const guardedBack = useGuardedPress(() => router.back());

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: '링크 검사 중',
          headerBackTitle: '',
          headerStyle: { backgroundColor: Colors.brand.background },
          headerTitleStyle: { ...Typography.title, color: Colors.brand.text },
          headerTintColor: Colors.brand.text,
          headerShadowVisible: false,
        }}
      />
      <View
        style={[
          styles.container,
          isShortScreen && styles.containerCompact,
          isVeryShortScreen && styles.containerVeryCompact,
          { paddingBottom: tabBarHeight + 24 },
        ]}
      >
        {/* Lottie 애니메이션 + 가운데 점 */}
        <View
          style={[
            styles.animationWrapper,
            { width: animationSize, height: animationSize },
            isShortScreen && styles.animationWrapperCompact,
            isVeryShortScreen && styles.animationWrapperVeryCompact,
          ]}
        >
          <LottieView
            source={require('@/assets/animations/scanning.json')}
            autoPlay={!hasError}
            loop={!hasError}
            style={[styles.animation, { width: animationSize, height: animationSize }]}
          />
          <View style={styles.dotsOverlay}>
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>

        {/* 텍스트 */}
        <Text style={[styles.title, isShortScreen && styles.titleCompact]}>
          {hasError ? '검사를 완료하지 못했어요' : '보안 검사 중입니다'}
        </Text>
        <Text style={[styles.subtitle, isShortScreen && styles.subtitleCompact, hasError && styles.errorText]}>
          {hasError ? errorMessage : '약 5-10초 정도 소요돼요'}
        </Text>

        {/* 검사 대상 카드 */}
        <View style={[styles.card, isShortScreen && styles.cardCompact]}>
          <Text style={styles.cardLabel}>검사 대상</Text>
          <Text style={styles.cardUrl} numberOfLines={1} ellipsizeMode="tail">
            {url}
          </Text>
        </View>

        {hasError && (
          <View style={[styles.buttonArea, isShortScreen && styles.buttonAreaCompact]}>
            <TouchableOpacity
              style={[styles.primaryButton, isVeryShortScreen && styles.buttonCompact]}
              onPress={guardedRetry}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>다시 검사</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.secondaryButton, isVeryShortScreen && styles.buttonCompact]}
              onPress={guardedBack}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>돌아가기</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </>
  );
}

async function runAnalysisPolling({
  getToken,
  url,
  signal,
}: {
  getToken: () => Promise<string | null>;
  url: string;
  signal: AbortSignal;
}) {
  const deadline = Date.now() + MAX_POLLING_MS;
  let analysis = await requestAnalysis(getToken, url, { signal });

  while (!signal.aborted) {
    const handled = handleAnalysisResult(analysis, url, signal);

    if (handled) {
      return;
    }

    const remainingMs = deadline - Date.now();

    if (remainingMs <= 0) {
      throw new Error('TIMEOUT');
    }

    await wait(Math.min(POLLING_INTERVAL_MS, remainingMs), signal);
    analysis = await fetchAnalysis(getToken, analysis.analysisId, { signal });
  }
}

function handleAnalysisResult(analysis: AnalysisResponse, fallbackUrl: string, signal: AbortSignal) {
  if (analysis.status === 'queued') {
    return false;
  }

  if (analysis.status === 'failed') {
    throw new Error(analysis.errorMessage || 'ANALYSIS_FAILED');
  }

  if (!analysis.verdict) {
    throw new Error('MISSING_VERDICT');
  }

  if (!signal.aborted) {
    router.replace({
      pathname: getResultPath(analysis.verdict),
      params: {
        url: analysis.originalUrl ?? fallbackUrl,
        analysisId: analysis.analysisId,
        verdict: analysis.verdict,
      },
    });
  }

  return true;
}

function getResultPath(verdict: AnalysisVerdict) {
  switch (verdict) {
    case 'safe':
      return '/(tabs)/(home)/scan-result';
    case 'caution':
      return '/(tabs)/(home)/scan-result-caution';
    case 'danger':
      return '/(tabs)/(home)/scan-result-block';
  }
}

function wait(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      reject(createAbortError());
      return;
    }

    const handleAbort = () => {
      clearTimeout(timer);
      reject(createAbortError());
    };

    const timer = setTimeout(() => {
      signal.removeEventListener('abort', handleAbort);
      resolve();
    }, ms);

    signal.addEventListener('abort', handleAbort, { once: true });
  });
}

function createAbortError() {
  const error = new Error('Analysis polling aborted');
  error.name = 'AbortError';
  return error;
}

function isAbortError(error: unknown) {
  return typeof error === 'object' && error !== null && 'name' in error && error.name === 'AbortError';
}

function getAnalysisErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401 || error.status === 403) {
      return '로그인 상태를 확인할 수 없습니다. 다시 로그인한 뒤 시도해주세요.';
    }

    return error.message || '링크 검사 요청에 실패했습니다. 잠시 후 다시 시도해주세요.';
  }

  if (error instanceof Error) {
    if (error.message === 'Missing Clerk session token') {
      return '로그인 상태를 확인할 수 없습니다. 다시 로그인한 뒤 시도해주세요.';
    }

    if (error.message === 'TIMEOUT') {
      return '분석 결과를 기다리는 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.';
    }

    if (error.message === 'MISSING_VERDICT') {
      return '분석 결과를 확인할 수 없습니다. 잠시 후 다시 시도해주세요.';
    }

    if (error.message && error.message !== 'ANALYSIS_FAILED') {
      return error.message;
    }
  }

  return '링크 검사에 실패했습니다. 잠시 후 다시 시도해주세요.';
}

function getUrlParam(value: string | string[] | undefined) {
  return typeof value === 'string' ? value : '';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.brand.background,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  containerCompact: {
    paddingTop: 20,
  },
  containerVeryCompact: {
    paddingTop: 12,
  },
  animationWrapper: {
    width: 280,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  animationWrapperCompact: {
    marginBottom: 20,
  },
  animationWrapperVeryCompact: {
    marginBottom: 14,
  },
  animation: {
    width: 280,
    height: 280,
    position: 'absolute',
  },
  dotsOverlay: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.brand.textHint,
  },
  title: {
    ...Typography.display,
    color: Colors.brand.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  titleCompact: {
    ...Typography.pageTitle,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.brand.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
  },
  subtitleCompact: {
    marginBottom: 24,
  },
  card: {
    width: '100%',
    backgroundColor: Colors.brand.surface,
    borderRadius: 16,
    padding: 16,
    gap: 6,
    marginBottom: 24,
  },
  cardCompact: {
    padding: 14,
    marginBottom: 18,
  },
  cardLabel: {
    ...Typography.caption,
    color: Colors.brand.textHint,
  },
  cardUrl: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.brand.text,
  },
  errorText: {
    color: Colors.brand.textWarning,
  },
  buttonArea: {
    width: '100%',
    gap: 12,
  },
  buttonAreaCompact: {
    gap: 10,
  },
  primaryButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonCompact: {
    height: 52,
    borderRadius: 26,
  },
  primaryButtonText: {
    ...Typography.section,
    color: Colors.brand.onPrimary,
  },
  secondaryButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.brand.surface,
    borderWidth: 1.5,
    borderColor: Colors.brand.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    ...Typography.section,
    color: Colors.brand.text,
  },
});
