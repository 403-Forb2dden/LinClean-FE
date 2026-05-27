import { useEffect, useState } from 'react';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Alert, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ResultStatusIcon } from '@/components/ui/result-status-icon';
import { ScanResultReason } from '@/components/ui/scan-result-reason';
import { getMockScanResultReason } from '@/constants/scan-result-reasons';
import { Colors, Typography } from '@/constants/theme';
import { getSavedLinkErrorMessage, useSavedLinks } from '@/context/saved-links-context';
import { LinkSaveModal } from '@/components/ui/link-save-modal';
import { useAnalysisResult } from '@/hooks/use-analysis-result';
import {
  getAnalysisDisplayUrl,
  getAnalysisFinalUrl,
  getAnalysisReasonText,
  getAnalysisResultPath,
  getRouteParam,
} from '@/utils/analysis-result-display';

export default function ScanResultCautionScreen() {
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
  const reason = getAnalysisReasonText(analysis, getMockScanResultReason('caution'));
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const shouldRedirectToVerdict = Boolean(analysis?.verdict && analysis.verdict !== 'caution');
  const isVerifyingAnalysis = Boolean(analysisId) && !errorMessage && (!analysis?.verdict || isLoading);
  const saveAnalysisId = analysis?.analysisId ?? analysisId;
  const canSave =
    Boolean(saveAnalysisId) &&
    displayUrl.trim().length > 0 &&
    !isLoading &&
    !shouldRedirectToVerdict &&
    !isSaving;

  useEffect(() => {
    if (!analysis?.verdict || analysis.verdict === 'caution') {
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

  const handleSave = async (title: string) => {
    if (!canSave || !saveAnalysisId) {
      return;
    }

    setIsSaving(true);

    try {
      await addLink({
        analysisId: saveAnalysisId,
        categoryId: null,
        title,
        description: analysis?.summary ?? '저장된 링크입니다.',
      });
      setSaveModalVisible(false);
      router.replace({
        pathname: '/(tabs)/(home)',
        params: { savedLinkToast: String(Date.now()) },
      });
    } catch (error) {
      Alert.alert(
        '저장 실패',
        getSavedLinkErrorMessage(error, '링크를 저장하지 못했습니다. 잠시 후 다시 시도해주세요.'),
      );
    } finally {
      setIsSaving(false);
    }
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
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* 주의 배지 */}
        <View style={styles.badgeArea}>
          <ResultStatusIcon variant="caution" label="주의" size="large" />
        </View>

        {/* 결과 텍스트 */}
        <Text style={styles.resultTitle}>주의가 필요한 링크입니다.</Text>

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
          <TouchableOpacity
            style={[styles.cautionButton, !canSave && styles.disabledButton]}
            onPress={() => setSaveModalVisible(true)}
            activeOpacity={0.8}
            disabled={!canSave}
          >
            <Text style={styles.cautionButtonText}>주의 후 저장</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={handleOpenUrl} activeOpacity={0.8}>
            <Text style={styles.secondaryButtonText}>즉시 URL 접속</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <LinkSaveModal
        visible={saveModalVisible}
        url={displayUrl}
        loading={isSaving}
        onCancel={() => {
          if (!isSaving) {
            setSaveModalVisible(false);
          }
        }}
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

  badgeArea: {
    alignItems: 'center',
    marginBottom: 20,
  },

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
    gap: 12,
  },
  cautionButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.brand.textCaution,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cautionButtonText: {
    ...Typography.section,
    color: Colors.brand.text,
  },
  disabledButton: {
    opacity: 0.45,
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
