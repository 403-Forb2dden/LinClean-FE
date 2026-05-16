import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Typography } from '@/constants/theme';
import { useSavedLinks } from '@/context/saved-links-context';
import { LinkSaveModal } from '@/components/ui/link-save-modal';

// TODO: 백엔드 연동 시 아래 흐름으로 교체
// 1. scanning.tsx에서 POST /api/v1/analyses → analysisId 수신 후 params로 전달
// 2. 여기서 POST /api/v1/saved-links { analysisId } 호출
// 3. 응답(id, title, siteName 등)을 addLink에 전달
// ERD: SAVED_LINK.analysis_id → ANALYSIS.analysis_id (FK)
// API 명세: Draft of the specification.md > 4.1 링크 저장 참고

export default function ScanResultScreen() {
  const { url } = useLocalSearchParams<{ url: string }>();
  const { addLink } = useSavedLinks();
  const [saveModalVisible, setSaveModalVisible] = useState(false);

  const handleSave = (title: string) => {
    const resolvedUrl = url ?? '';

    // TODO: POST /api/v1/saved-links { analysisId } 호출 후 응답으로 교체
    // 현재는 URL 기반 mock 데이터로 즉시 추가
    addLink({
      id: Date.now(),
      analysisId: `mock-${Date.now()}`,
      categoryId: null,
      originalUrl: resolvedUrl,
      finalUrl: resolvedUrl || null,
      title,
      description: '저장된 링크입니다.',
      siteName: (() => {
        try { return new URL(resolvedUrl).hostname; } catch { return '알 수 없음'; }
      })(),
      verdict: 'safe',
      isBookmarked: false,
      createdAt: new Date().toISOString(),
    });
    setSaveModalVisible(false);
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
          <View style={styles.orbOuter}>
            <View style={styles.orbInner}>
              <Ionicons name="shield-checkmark" size={56} color={Colors.brand.primary} />
            </View>
          </View>

          {/* 안전 칩 */}
          <View style={styles.chip}>
            <Text style={styles.chipText}>안전</Text>
          </View>
        </View>

        {/* 결과 텍스트 */}
        <Text style={styles.resultTitle}>안전한 웹사이트입니다.</Text>
        <Text style={styles.resultSubtitle}>저장 후 바로 접속하거나,{'\n'}즉시 URL로 이동할 수 있어요.</Text>

        {/* 검사 대상 카드 */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>검사 대상</Text>
          <Text style={styles.cardUrl} numberOfLines={1} ellipsizeMode="tail">
            {url}
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
        url={url ?? ''}
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
    paddingTop: 40,
    paddingBottom: 40,
    alignItems: 'center',
  },

  // 배지 영역
  badgeArea: {
    alignItems: 'center',
    marginBottom: 32,
  },
  orbOuter: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: Colors.brand.softMint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  orbInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.brand.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chip: {
    backgroundColor: Colors.brand.surface,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: Colors.brand.line,
  },
  chipText: {
    ...Typography.summary,
    color: Colors.brand.text,
  },

  // 결과 텍스트
  resultTitle: {
    ...Typography.display,
    color: Colors.brand.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  resultSubtitle: {
    ...Typography.body,
    color: Colors.brand.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },

  // 검사 대상 카드
  card: {
    width: '100%',
    backgroundColor: Colors.brand.surface,
    borderRadius: 16,
    padding: 16,
    gap: 6,
    marginBottom: 40,
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
