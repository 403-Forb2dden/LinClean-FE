import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Typography } from '@/constants/theme';
import { ResultStatusIcon } from '@/components/ui/result-status-icon';
import { useSavedLinks } from '@/context/saved-links-context';

export default function ScanResultCautionScreen() {
  const { url } = useLocalSearchParams<{ url: string }>();
  const { addLink } = useSavedLinks();

  const handleSave = () => {
    // TODO: POST /api/v1/saved-links { analysisId } 호출 후 응답으로 교체
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
      verdict: 'caution',
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
        {/* 주의 배지 */}
        <View style={styles.badgeArea}>
          <ResultStatusIcon variant="caution" label="주의" />
        </View>

        {/* 결과 텍스트 */}
        <Text style={styles.resultTitle}>주의가 필요한 링크입니다.</Text>
        <Text style={styles.resultSubtitle}>
          {'의심 신호가 일부 감지됐어요.\n계속 진행할지 한번 더 확인하세요.'}
        </Text>

        {/* 검사 대상 카드 */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>검사 대상</Text>
          <Text style={styles.cardUrl} numberOfLines={1} ellipsizeMode="tail">
            {url}
          </Text>
        </View>

        {/* 버튼 영역 */}
        <View style={styles.buttonArea}>
          <TouchableOpacity style={styles.cautionButton} onPress={handleSave} activeOpacity={0.8}>
            <Text style={styles.cautionButtonText}>주의 후 저장</Text>
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
    paddingTop: 40,
    paddingBottom: 40,
    alignItems: 'center',
  },

  badgeArea: {
    alignItems: 'center',
    marginBottom: 32,
  },

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

  card: {
    width: '100%',
    backgroundColor: Colors.light.background,
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
