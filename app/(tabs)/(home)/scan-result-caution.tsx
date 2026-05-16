import { useState } from 'react';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ResultStatusIcon } from '@/components/ui/result-status-icon';
import { ScanResultReason } from '@/components/ui/scan-result-reason';
import { getMockScanResultReason } from '@/constants/scan-result-reasons';
import { Colors, Typography } from '@/constants/theme';
import { useSavedLinks } from '@/context/saved-links-context';
import { LinkSaveModal } from '@/components/ui/link-save-modal';

export default function ScanResultCautionScreen() {
  const { url } = useLocalSearchParams<{ url: string }>();
  const { addLink } = useSavedLinks();
  // TODO: 테스트용 mock 판정 이유입니다. 백엔드 reason 응답 연동 시 제거합니다.
  const reason = getMockScanResultReason('caution');

    // TODO: POST /api/v1/saved-links { analysisId } 호출 후 응답으로 교체
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
      verdict: 'caution',
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
        {/* 주의 배지 */}
        <View style={styles.badgeArea}>
          <ResultStatusIcon variant="caution" label="주의" size="large" />
        </View>

        {/* 결과 텍스트 */}
        <Text style={styles.resultTitle}>주의가 필요한 링크입니다.</Text>

        <ScanResultReason reason={reason} style={styles.reasonCard} />

        {/* 검사 대상 카드 */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>검사 대상</Text>
          <Text style={styles.cardUrl} numberOfLines={1} ellipsizeMode="tail">
            {url}
          </Text>
        </View>

        {/* 버튼 영역 */}
        <View style={styles.buttonArea}>
          <TouchableOpacity style={styles.cautionButton} onPress={() => setSaveModalVisible(true)} activeOpacity={0.8}>
            <Text style={styles.cautionButtonText}>주의 후 저장</Text>
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
