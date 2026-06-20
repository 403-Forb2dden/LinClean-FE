import { useAuth } from '@clerk/expo';
import LottieView from 'lottie-react-native';
import { useIsFocused } from '@react-navigation/native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { BackHandler, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

import { fetchAnalysis, requestAnalysis, type AnalysisResponse, type AnalysisVerdict } from '@/api/analyses';
import { ApiError } from '@/api/api-client';
import { checkSavedLinkUrl } from '@/api/saved-links';
import { Colors, Typography } from '@/constants/theme';
import { AppIcon } from '@/components/ui/app-icon';
import { useAnalysisResultCache } from '@/context/analysis-result-cache-context';
import { markPerformance, measurePerformance } from '@/utils/performance-trace';
import { useGuardedPress } from '@/utils/press-guard';

const POLLING_INTERVAL_MS = 2_000;
const SCAN_SCREEN_TIMEOUT_MS = 20_000;
const SHORT_SCREEN_HEIGHT = 760;
const VERY_SHORT_SCREEN_HEIGHT = 700;
const DEFAULT_ANIMATION_SIZE = 280;
const SHORT_ANIMATION_SIZE = 216;
const VERY_SHORT_ANIMATION_SIZE = 188;
const PAGE_UNAVAILABLE_ERROR_CODE = 'PAGE_UNAVAILABLE';
const SCAN_STEP_MESSAGES = {
  checkingDuplicate: '\uC800\uC7A5 \uC5EC\uBD80\uB97C \uD655\uC778\uD558\uACE0 \uC788\uC5B4\uC694',
  requestingAnalysis: '\uBCF4\uC548 \uAC80\uC0AC\uB97C \uC694\uCCAD\uD558\uACE0 \uC788\uC5B4\uC694',
  pollingAnalysis: '\uAC80\uC0AC \uACB0\uACFC\uB97C \uD655\uC778\uD558\uACE0 \uC788\uC5B4\uC694',
};
const PAGE_UNAVAILABLE_DEFAULT_MESSAGE = '페이지에 연결할 수 없습니다.';
const PAGE_UNAVAILABLE_HELP_MESSAGE =
  '사이트 접속이 제한되었거나 일시적으로 응답하지 않을 수 있습니다.';

export default function ScanningScreen() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { setAnalysisResult } = useAnalysisResultCache();
  const isFocused = useIsFocused();
  const { url: urlParam } = useLocalSearchParams<{ url?: string | string[] }>();
  const url = getUrlParam(urlParam);
  const { height: windowHeight } = useWindowDimensions();
  const tabBarHeight = useBottomTabBarHeight();
  const [errorMessage, setErrorMessage] = useState('');
  const [scanStepMessage, setScanStepMessage] = useState(SCAN_STEP_MESSAGES.checkingDuplicate);
  const [retryKey, setRetryKey] = useState(0);
  const getTokenRef = useRef(getToken);
  const currentAbortControllerRef = useRef<AbortController | null>(null);
  const hasNavigatedRef = useRef(false);
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
    let screenTimeoutId: ReturnType<typeof setTimeout> | null = null;
    let isActive = true;
    let didTimeout = false;
    let hasNavigated = false;

    const clearScreenTimeout = () => {
      if (screenTimeoutId) {
        clearTimeout(screenTimeoutId);
        screenTimeoutId = null;
      }
    };

    const handleScreenTimeout = () => {
      if (!isActive || didTimeout || hasNavigated) {
        return;
      }

      didTimeout = true;
      abortController.abort();
      setErrorMessage(getAnalysisErrorMessage(new Error('TIMEOUT')));
    };

    currentAbortControllerRef.current = abortController;
    hasNavigatedRef.current = false;

    if (!isLoaded) {
      return () => {
        isActive = false;
        if (currentAbortControllerRef.current === abortController) {
          currentAbortControllerRef.current = null;
        }
        abortController.abort();
      };
    }

    if (!isSignedIn) {
      setErrorMessage('로그인 상태를 확인할 수 없습니다. 다시 로그인한 뒤 시도해주세요.');
      return () => {
        isActive = false;
        if (currentAbortControllerRef.current === abortController) {
          currentAbortControllerRef.current = null;
        }
        abortController.abort();
      };
    }

    if (!url) {
      setErrorMessage('검사할 URL을 찾을 수 없습니다. 링크를 다시 입력해주세요.');
      return () => {
        isActive = false;
        if (currentAbortControllerRef.current === abortController) {
          currentAbortControllerRef.current = null;
        }
        abortController.abort();
      };
    }

    measurePerformance('scan_button_to_scanning_screen', 'scan_button_pressed');
    setErrorMessage('');
    setScanStepMessage(SCAN_STEP_MESSAGES.checkingDuplicate);
    screenTimeoutId = setTimeout(handleScreenTimeout, SCAN_SCREEN_TIMEOUT_MS);

    runAnalysisPolling({
      getToken: () => getTokenRef.current(),
      url,
      signal: abortController.signal,
      onStep: setScanStepMessage,
      onResolvedAnalysis: setAnalysisResult,
      canNavigate: () => isActive && !didTimeout && !hasNavigated,
      onNavigate: () => {
        hasNavigated = true;
        hasNavigatedRef.current = true;
        clearScreenTimeout();
      },
    })
      .catch((error) => {
        if (!isActive || hasNavigated || didTimeout) {
          return;
        }

        if (isAbortError(error)) {
          return;
        }

        setErrorMessage(getAnalysisErrorMessage(error));
      })
      .finally(() => {
        clearScreenTimeout();
      });

    return () => {
      isActive = false;
      clearScreenTimeout();
      if (currentAbortControllerRef.current === abortController) {
        currentAbortControllerRef.current = null;
      }
      abortController.abort();
    };
  }, [isLoaded, isSignedIn, retryKey, setAnalysisResult, url]);

  const hasError = errorMessage.length > 0;
  const isScanning = !hasError;
  const isScanningAnimationVisible = isFocused && isScanning;
  const guardedRetry = useGuardedPress(() => setRetryKey((key) => key + 1));
  const guardedBack = useGuardedPress(() => router.back());

  useEffect(() => {
    if (!isScanningAnimationVisible) {
      return undefined;
    }

    const animationTimeoutId = setTimeout(() => {
      if (hasNavigatedRef.current) {
        return;
      }

      currentAbortControllerRef.current?.abort();
      setErrorMessage(getAnalysisErrorMessage(new Error('TIMEOUT')));
    }, SCAN_SCREEN_TIMEOUT_MS);

    return () => clearTimeout(animationTimeoutId);
  }, [isScanningAnimationVisible, retryKey, url]);

  useEffect(() => {
    if (!isScanning) {
      return undefined;
    }

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => true);

    return () => {
      subscription.remove();
    };
  }, [isScanning]);

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
          headerBackVisible: !isScanning,
          gestureEnabled: !isScanning,
          headerLeft: isScanning
            ? () => (
                <AppIcon
                  name="back"
                  disabled
                  style={styles.headerBackButton}
                />
              )
            : undefined,
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
            autoPlay={isScanningAnimationVisible}
            loop={isScanningAnimationVisible}
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
          {hasError ? errorMessage : scanStepMessage}
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
  onStep,
  onResolvedAnalysis,
  canNavigate,
  onNavigate,
}: {
  getToken: () => Promise<string | null>;
  url: string;
  signal: AbortSignal;
  onStep: (message: string) => void;
  onResolvedAnalysis: (analysis: AnalysisResponse) => void;
  canNavigate: () => boolean;
  onNavigate: () => void;
}) {
  const deadline = Date.now() + SCAN_SCREEN_TIMEOUT_MS;
  markPerformance('saved_link_duplicate_check_started');
  onStep(SCAN_STEP_MESSAGES.checkingDuplicate);
  const savedLinkCheck = await checkSavedLinkUrl(getToken, url, { signal });
  measurePerformance('saved_link_duplicate_check_completed', 'saved_link_duplicate_check_started');

  if (savedLinkCheck.exists) {
    throw new Error('DUPLICATE_SAVED_LINK');
  }

  markPerformance('analysis_request_started');
  onStep(SCAN_STEP_MESSAGES.requestingAnalysis);
  let analysis = await requestAnalysis(getToken, url, { signal });
  measurePerformance('analysis_request_completed', 'analysis_request_started');

  while (!signal.aborted) {
    const handled = handleAnalysisResult(
      analysis,
      url,
      signal,
      canNavigate,
      onNavigate,
      onResolvedAnalysis,
    );

    if (handled) {
      return;
    }

    const remainingMs = deadline - Date.now();

    if (remainingMs <= 0) {
      throw new Error('TIMEOUT');
    }

    await wait(Math.min(POLLING_INTERVAL_MS, remainingMs), signal);
    onStep(SCAN_STEP_MESSAGES.pollingAnalysis);
    analysis = await fetchAnalysis(getToken, analysis.analysisId, { signal });
  }
}

function handleAnalysisResult(
  analysis: AnalysisResponse,
  fallbackUrl: string,
  signal: AbortSignal,
  canNavigate: () => boolean,
  onNavigate: () => void,
  onResolvedAnalysis: (analysis: AnalysisResponse) => void,
) {
  if (analysis.status === 'queued') {
    return false;
  }

  if (analysis.status === 'failed') {
    throw new Error(getFailedAnalysisErrorMessage(analysis));
  }

  if (!analysis.verdict) {
    throw new Error('MISSING_VERDICT');
  }

  if (!signal.aborted && canNavigate()) {
    markPerformance('analysis_result_received');
    onResolvedAnalysis(analysis);
    onNavigate();
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

    if (error.message === 'DUPLICATE_SAVED_LINK') {
      return '\uC774\uBBF8 \uC800\uC7A5\uB41C \uB9C1\uD06C\uC785\uB2C8\uB2E4.';
    }

    if (error.message && error.message !== 'ANALYSIS_FAILED') {
      return error.message;
    }
  }

  return '링크 검사에 실패했습니다. 잠시 후 다시 시도해주세요.';
}

function getFailedAnalysisErrorMessage(analysis: AnalysisResponse) {
  if (analysis.errorCode === PAGE_UNAVAILABLE_ERROR_CODE) {
    return getPageUnavailableErrorMessage(analysis.errorMessage);
  }

  return analysis.errorMessage?.trim() || 'ANALYSIS_FAILED';
}

function getPageUnavailableErrorMessage(errorMessage?: string) {
  const normalizedMessage = errorMessage?.trim();

  if (!normalizedMessage || isTechnicalErrorCode(normalizedMessage)) {
    return `${PAGE_UNAVAILABLE_DEFAULT_MESSAGE}\n${PAGE_UNAVAILABLE_HELP_MESSAGE}`;
  }

  if (normalizedMessage.includes(PAGE_UNAVAILABLE_HELP_MESSAGE)) {
    return normalizedMessage;
  }

  return `${normalizedMessage}\n${PAGE_UNAVAILABLE_HELP_MESSAGE}`;
}

function isTechnicalErrorCode(value: string) {
  return /^[A-Z0-9_]+$/.test(value) || /^[a-z0-9_]+$/.test(value);
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
  headerBackButton: {
    width: 44,
    height: 44,
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
