import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/ui/app-icon';
import { Colors, Typography } from '@/constants/theme';

export default function PrivacyScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <AppIcon name="back" onPress={() => router.back()} />
        <Text style={styles.title}>개인정보 처리방침</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.updated}>최종 업데이트: 2026년 4월 1일</Text>

        <Section title="1. 수집하는 개인정보 항목">
          {`LinClean은 서비스 제공을 위해 다음과 같은 정보를 수집합니다.\n\n• 카카오 로그인을 통한 식별자(kakao_id)\n• 기기 토큰(FCM push token)\n• 사용자가 입력·저장한 URL 및 분석 결과`}
        </Section>

        <Section title="2. 개인정보 수집·이용 목적">
          {`수집한 정보는 다음 목적으로만 사용됩니다.\n\n• 회원 식별 및 로그인 유지\n• URL 보안 분석 및 결과 저장\n• 푸시 알림 발송\n• 서비스 품질 개선 및 통계 분석`}
        </Section>

        <Section title="3. 개인정보 보유 및 이용 기간">
          {`회원 탈퇴 시 개인정보는 즉시 삭제됩니다. 단, 관계 법령에 따라 일정 기간 보관이 필요한 경우 해당 기간 동안 보관 후 삭제합니다.`}
        </Section>

        <Section title="4. 개인정보의 제3자 제공">
          {`LinClean은 이용자의 개인정보를 원칙적으로 제3자에게 제공하지 않습니다. 다만, 이용자의 사전 동의가 있는 경우 또는 법령의 규정에 따른 경우는 예외로 합니다.`}
        </Section>

        <Section title="5. 이용자의 권리">
          {`이용자는 언제든지 자신의 개인정보를 조회·수정할 수 있으며, 회원 탈퇴를 통해 개인정보 삭제를 요청할 수 있습니다. 관련 문의는 앱 내 고객센터를 통해 접수해 주세요.`}
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: string }) {
  return (
    <View style={sectionStyles.container}>
      <Text style={sectionStyles.title}>{title}</Text>
      <Text style={sectionStyles.body}>{children}</Text>
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  container: {
    gap: 8,
  },
  title: {
    ...Typography.profile,
    color: Colors.brand.text,
  },
  body: {
    ...Typography.body,
    color: Colors.brand.textSecondary,
    lineHeight: 24,
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
    gap: 24,
  },
  updated: {
    ...Typography.caption,
    color: Colors.brand.textHint,
  },
});
