import { useState } from 'react';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ResultStatusIcon } from '@/components/ui/result-status-icon';
import { ScanResultReason } from '@/components/ui/scan-result-reason';
import { getMockScanResultReason } from '@/constants/scan-result-reasons';
import { Colors, Typography } from '@/constants/theme';
import { useSavedLinks } from '@/context/saved-links-context';
import { LinkSaveModal } from '@/components/ui/link-save-modal';
import { useAnalysisResult } from '@/hooks/use-analysis-result';
import {
  getAnalysisDisplayUrl,
  getAnalysisFinalUrl,
  getAnalysisReasonText,
  getRouteParam,
  getSiteName,
} from '@/utils/analysis-result-display';

// TODO: 백엔드 연동 시 아래 흐름으로 교체
// 1. scanning.tsx에서 POST /api/v1/analyses → analysisId 수신 후 params로 전달
// 2. 여기서 POST /api/v1/saved-links { analysisId } 호출
// 3. 응답(id, title, siteName 등)을 addLink에 전달
// ERD: SAVED_LINK.analysis_id → ANALYSIS.analysis_id (FK)
// API 명세: Draft of the specification.md > 4.1 링크 저장 참고

export default function ScanResultScreen() {
  const {
    analysisId: analysisIdParam,
    url: urlParam,
  } = useLocalSearchParams<{ analysisId?: string | string[]; url?: string | string[] }>();
  const { addLink } = useSavedLinks();
  const analysisId = getRouteParam(analysisIdParam);
  const url = getRouteParam(urlParam);
  const { analysis, isLoading, errorMessage } = useAnalysisResult(analysisId);
  const displayUrl = getAnalysisDisplayUrl(analysis, url);
  const finalUrl = getAnalysisFinalUrl(analysis, displayUrl);
  const reason = getAnalysisReasonText(analysis, getMockScanResultReason('safe'));
  const [saveModalVisible, setSaveModalVisible] = useState(false);

  const handleSave = (title: string) => {
    // TODO: POST /api/v1/saved-links { analysisId } 호출 후 응답으로 교체
    // 현재는 URL 기반 mock 데이터로 즉시 추가
    addLink({
      id: Date.now(),
      analysisId: analysis?.analysisId ?? analysisId ?? `mock-${Date.now()}`,
      categoryId: null,
      originalUrl: displayUrl,
      finalUrl: finalUrl || null,
      title,
      description: analysis?.summary ?? '저장된 링크입니다.',
      siteName: getSiteName(finalUrl || displayUrl),
      verdict: analysis?.verdict ?? 'safe',
      isBookmarked: false,
      createdAt: new Date().toISOString(),
    });
    setSaveModalVisible(false);
    router.dismissAll();
  };

  const handleOpenUrl = async () => {
    if (finalUrl) {
      try {
        await Linking.openURL(finalUrl);
      } catch {
        // URL을 열 수 없는 경우 무시
      }
    }
  };

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
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* 안전 배지 영역 */}
        <View style={styles.badgeArea}>
          <ResultStatusIcon variant="safe" label="안전" size="large" />
        </View>

        {/* 결과 텍스트 */}
        <Text style={styles.resultTitle}>안전한 웹사이트입니다.</Text>

        {isLoading && <Text style={styles.statusText}>분석 결과를 불러오는 중입니다.</Text>}
        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        <ScanResultReason reason={reason} style={styles.reasonCard} />

        {/* 검사 대상 카드 */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>검사 대상</Text>
          <Text style={styles.cardUrl} numberOfLines={1} ellipsizeMode="tail">
            {displayUrl}
          </Text>
        </View>

        {/* 버튼 영역 */}
        <View style={styles.buttonArea}>
          <TouchableOpacity style={styles.primaryButton} onPress={() => setSaveModalVisible(true)} activeOpacity={0.8}>
            <Text style={styles.primaryButtonText}>저장</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={handleOpenUrl} activeOpacity={0.8}>
            <Text style={styles.secondaryButtonText}>즉시 URL 접속</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <LinkSaveModal
        visible={saveModalVisible}
        url={displayUrl}
        onCancel={() => setSaveModalVisible(false)}
        onSave={handleSave}
      />
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

  // 배지 영역
  badgeArea: {
    alignItems: 'center',
    marginBottom: 20,
  },

  // 결과 텍스트
  resultTitle: {
    ...Typography.displayMedium,
    color: Colors.brand.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  reasonCard: {
    marginBottom: 24,
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
  // 검사 대상 카드
  card: {
    width: '100%',
    backgroundColor: Colors.brand.surface,
    borderRadius: 16,
    padding: 16,
    gap: 6,
    marginBottom: 28,
  },
  cardLabel: {
    ...Typography.caption,
    color: Colors.brand.textHint,
  },
  cardUrl: {
    ...Typography.url,
    color: Colors.brand.text,
  },

  // 버튼 영역
  buttonArea: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
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
