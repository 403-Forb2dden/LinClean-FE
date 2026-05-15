import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/ui/app-icon';
import { Colors, Typography } from '@/constants/theme';

// TODO: 서비스 이용방법은 추후 GET /api/v1/app-documents/service_guide API 연동으로 대체
const STEPS = [
  {
    step: '01',
    title: 'URL 입력',
    description: '하단 + 버튼을 눌러 검사하고 싶은 URL을 붙여넣거나 직접 입력하세요.',
  },
  {
    step: '02',
    title: '보안 분석',
    description: 'LinClean이 입력한 URL을 4단계 파이프라인으로 자동 분석합니다. 분석은 보통 수 초 이내에 완료됩니다.',
  },
  {
    step: '03',
    title: '결과 확인',
    description: '분석 결과는 안전(safe) · 주의(caution) · 위험(danger) 3단계로 표시됩니다. 상세 근거도 함께 확인할 수 있습니다.',
  },
  {
    step: '04',
    title: '링크 저장 및 관리',
    description: '안전한 링크는 저장해두고 폴더로 분류할 수 있습니다. 북마크 기능으로 중요한 링크를 빠르게 찾아보세요.',
  },
];

const VERDICT_COLORS: Record<string, string> = {
  safe: Colors.brand.primary,
  caution: Colors.brand.textCaution,
  danger: Colors.brand.textWarning,
};

export default function HowToUseScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <AppIcon name="back" onPress={() => router.back()} />
        <Text style={styles.title}>서비스 이용방법</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.intro}>
          LinClean은 URL의 보안 위험도를 분석하고 안전한 링크를 관리할 수 있는 서비스입니다.
        </Text>

        <View style={styles.steps}>
          {STEPS.map((item) => (
            <View key={item.step} style={styles.stepRow}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepNumber}>{item.step}</Text>
              </View>
              <View style={styles.stepBody}>
                <Text style={styles.stepTitle}>{item.title}</Text>
                <Text style={styles.stepDesc}>{item.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* 보안 등급 설명 */}
        <View style={styles.verdictSection}>
          <Text style={styles.verdictHeading}>보안 등급 기준</Text>
          <View style={styles.verdictList}>
            <VerdictRow color={VERDICT_COLORS.safe} label="안전 (Safe)" desc="점수 0~30 · 신뢰할 수 있는 링크" />
            <VerdictRow color={VERDICT_COLORS.caution} label="주의 (Caution)" desc="점수 31~60 · 접속 시 주의가 필요한 링크" />
            <VerdictRow color={VERDICT_COLORS.danger} label="위험 (Danger)" desc="점수 61~100 · 접속을 권장하지 않는 링크" />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function VerdictRow({ color, label, desc }: { color: string; label: string; desc: string }) {
  return (
    <View style={verdictStyles.row}>
      <View style={[verdictStyles.dot, { backgroundColor: color }]} />
      <View style={verdictStyles.body}>
        <Text style={verdictStyles.label}>{label}</Text>
        <Text style={verdictStyles.desc}>{desc}</Text>
      </View>
    </View>
  );
}

const verdictStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  body: {
    flex: 1,
    gap: 2,
  },
  label: {
    ...Typography.profile,
    color: Colors.brand.text,
  },
  desc: {
    ...Typography.summary,
    color: Colors.brand.textSecondary,
  },
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.brand.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  title: {
    ...Typography.section,
    color: Colors.brand.text,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 28,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 40,
    gap: 28,
  },
  intro: {
    ...Typography.body,
    color: Colors.brand.textSecondary,
    lineHeight: 24,
  },
  steps: {
    gap: 20,
  },
  stepRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-start',
  },
  stepBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.brand.softMint,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepNumber: {
    ...Typography.bold12,
    color: Colors.brand.primaryDeep,
  },
  stepBody: {
    flex: 1,
    gap: 4,
  },
  stepTitle: {
    ...Typography.profile,
    color: Colors.brand.text,
  },
  stepDesc: {
    ...Typography.body,
    color: Colors.brand.textSecondary,
    lineHeight: 22,
  },
  verdictSection: {
    backgroundColor: Colors.brand.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.brand.line,
    padding: 18,
    gap: 14,
  },
  verdictHeading: {
    ...Typography.profile,
    color: Colors.brand.text,
  },
  verdictList: {
    gap: 12,
  },
});
