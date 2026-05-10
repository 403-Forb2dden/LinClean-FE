import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ResultStatusIcon } from '@/components/ui/result-status-icon';
import { ScanResultReason } from '@/components/ui/scan-result-reason';
import { getMockScanResultReason } from '@/constants/scan-result-reasons';
import { Colors, Typography } from '@/constants/theme';
import { useSavedLinks } from '@/context/saved-links-context';

// TODO: 백엔드 연동 시 아래 흐름으로 교체
// 1. scanning.tsx에서 POST /api/v1/analyses → analysisId 수신 후 params로 전달
// 2. 여기서 POST /api/v1/saved-links { analysisId } 호출
// 3. 응답(id, title, siteName 등)을 addLink에 전달
// ERD: SAVED_LINK.analysis_id → ANALYSIS.analysis_id (FK)
// API 명세: Draft of the specification.md > 4.1 링크 저장 참고

export default function ScanResultScreen() {
  const { url } = useLocalSearchParams<{ url: string }>();
  const { addLink } = useSavedLinks();
  // TODO: 테스트용 mock 판정 이유입니다. 백엔드 reason 응답 연동 시 제거합니다.
  const reason = getMockScanResultReason('safe');

  const handleSave = () => {
    // TODO: POST /api/v1/saved-links { analysisId } 호출 후 응답으로 교체
    // 현재는 URL 기반 mock 데이터로 즉시 추가
    addLink({
      id: Date.now(),
      analysisId: `mock-${Date.now()}`,
      categoryId: null,
      originalUrl: url ?? '',
      finalUrl: url ?? null,
      title: url ?? '제목 없음',
      description: '저장된 링크입니다.',
      siteName: (() => {
        try { return new URL(url ?? '').hostname; } catch { return '알 수 없음'; }
      })(),
      verdict: 'safe',
      isBookmarked: false,
      createdAt: new Date().toISOString(),
    });
    router.dismissAll();
  };

  const handleOpenUrl = async () => {
    if (url) {
      try {
        await Linking.openURL(url);
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

        <ScanResultReason reason={reason} />

        {/* 검사 대상 카드 */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>검사 대상</Text>
          <Text style={styles.cardUrl} numberOfLines={1} ellipsizeMode="tail">
            {url}
          </Text>
        </View>

        {/* 버튼 영역 */}
        <View style={styles.buttonArea}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleSave} activeOpacity={0.8}>
            <Text style={styles.primaryButtonText}>저장</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={handleOpenUrl} activeOpacity={0.8}>
            <Text style={styles.secondaryButtonText}>즉시 URL 접속</Text>
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

  // 배지 영역
  badgeArea: {
    alignItems: 'center',
    marginBottom: 20,
  },

  // 결과 텍스트
  resultTitle: {
    ...Typography.display,
    fontSize: 30,
    color: Colors.brand.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  // 검사 대상 카드
  card: {
    width: '100%',
    backgroundColor: Colors.light.background,
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
    color: Colors.light.background,
  },
  secondaryButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.light.background,
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
