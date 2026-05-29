import { useEffect } from 'react';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { ResultStatusIcon } from '@/components/ui/result-status-icon';
import { ScanResultReason } from '@/components/ui/scan-result-reason';
import { getMockScanResultReason } from '@/constants/scan-result-reasons';
import { Colors, Typography } from '@/constants/theme';
import { useAnalysisResult } from '@/hooks/use-analysis-result';
import {
  getAnalysisDisplayUrl,
  getAnalysisReasonText,
  getAnalysisResultPath,
  getRouteParam,
} from '@/utils/analysis-result-display';
import { useGuardedPress } from '@/utils/press-guard';

const COMPACT_RESULT_HEIGHT = 760;
const VERY_COMPACT_RESULT_HEIGHT = 700;

export default function ScanResultBlockScreen() {
  const {
    analysisId: analysisIdParam,
    url: urlParam,
  } = useLocalSearchParams<{ analysisId?: string | string[]; url?: string | string[] }>();
  const { height: windowHeight } = useWindowDimensions();
  const tabBarHeight = useBottomTabBarHeight();
  const analysisId = getRouteParam(analysisIdParam);
  const url = getRouteParam(urlParam);
  const { analysis, isLoading, errorMessage } = useAnalysisResult(analysisId);
  const displayUrl = getAnalysisDisplayUrl(analysis, url);
  const reason = getAnalysisReasonText(analysis, getMockScanResultReason('danger'));
  const shouldRedirectToVerdict = Boolean(analysis?.verdict && analysis.verdict !== 'danger');
  const isVerifyingAnalysis = Boolean(analysisId) && !errorMessage && (!analysis?.verdict || isLoading);
  const isCompactResult = windowHeight <= COMPACT_RESULT_HEIGHT;
  const isVeryCompactResult = windowHeight <= VERY_COMPACT_RESULT_HEIGHT;
  const guardedDismissAll = useGuardedPress(() => router.dismissAll());

  useEffect(() => {
    if (!analysis?.verdict || analysis.verdict === 'danger') {
      return;
    }

    router.replace({
      pathname: getAnalysisResultPath(analysis.verdict),
      params: {
        url: analysis.originalUrl ?? url ?? '',
        analysisId: analysis.analysisId,
        verdict: analysis.verdict,
      },
    });
  }, [analysis, url]);

  if (isVerifyingAnalysis || shouldRedirectToVerdict) {
    return (
      <>
        <Stack.Screen
          options={{
            headerShown: true,
            title: '검사 결과',
            headerBackTitle: '',
            headerStyle: { backgroundColor: Colors.brand.background },
            headerTitleStyle: { ...Typography.title, color: Colors.brand.text },
            headerTintColor: Colors.brand.text,
            headerShadowVisible: false,
          }}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.statusText}>분석 결과를 불러오는 중입니다.</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: '검사 결과',
          headerBackTitle: '',
          headerStyle: { backgroundColor: Colors.brand.background },
          headerTitleStyle: { ...Typography.title, color: Colors.brand.text },
          headerTintColor: Colors.brand.text,
          headerShadowVisible: false,
        }}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.container,
          isCompactResult && styles.containerCompact,
          { paddingBottom: tabBarHeight + (isCompactResult ? 16 : 24) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* 차단 배지 */}
        <View style={[styles.badgeArea, isCompactResult && styles.badgeAreaCompact]}>
          <ResultStatusIcon variant="block" label="차단" size="large" compact={isCompactResult} />
        </View>

        {/* 결과 텍스트 */}
        <Text style={[styles.resultTitle, isCompactResult && styles.resultTitleCompact]}>
          차단된 위험 링크입니다.
        </Text>

        {isLoading && <Text style={styles.statusText}>분석 결과를 불러오는 중입니다.</Text>}
        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        <ScanResultReason reason={reason} style={[styles.reasonCard, isCompactResult && styles.reasonCardCompact]} />

        {/* 검사 대상 카드 */}
        <View style={[styles.card, isCompactResult && styles.cardCompact]}>
          <Text style={styles.cardLabel}>검사 대상</Text>
          <Text style={styles.cardUrl} numberOfLines={1} ellipsizeMode="tail">
            {displayUrl}
          </Text>
        </View>

        {/* 확인 버튼 */}
        <View style={styles.buttonArea}>
          <TouchableOpacity
            style={[styles.confirmButton, isVeryCompactResult && styles.buttonVeryCompact]}
            onPress={guardedDismissAll}
            activeOpacity={0.8}
          >
            <Text style={styles.confirmButtonText}>확인</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: Colors.brand.background,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 4,
    paddingBottom: 32,
    alignItems: 'center',
  },
  containerCompact: {
    paddingTop: 0,
  },

  badgeArea: {
    alignItems: 'center',
    marginBottom: 20,
  },
  badgeAreaCompact: {
    marginBottom: 12,
  },

  resultTitle: {
    ...Typography.displayMedium,
    color: Colors.brand.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  resultTitleCompact: {
    ...Typography.pageTitle,
    marginBottom: 8,
  },
  reasonCard: {
    marginBottom: 24,
  },
  reasonCardCompact: {
    marginBottom: 16,
  },
  statusText: {
    ...Typography.caption,
    color: Colors.brand.textSecondary,
    textAlign: 'center',
    marginBottom: 10,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.brand.textWarning,
    textAlign: 'center',
    marginBottom: 10,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.brand.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    backgroundColor: Colors.brand.surface,
    borderRadius: 16,
    padding: 16,
    gap: 6,
    marginBottom: 28,
  },
  cardCompact: {
    padding: 14,
    marginBottom: 20,
  },
  cardLabel: {
    ...Typography.caption,
    color: Colors.brand.textHint,
  },
  cardUrl: {
    ...Typography.url,
    color: Colors.brand.text,
  },

  buttonArea: {
    width: '100%',
  },
  confirmButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.brand.textWarning,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonVeryCompact: {
    height: 52,
    borderRadius: 26,
  },
  confirmButtonText: {
    ...Typography.section,
    color: Colors.brand.onPrimary,
  },
});
