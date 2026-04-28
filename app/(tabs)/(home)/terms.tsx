import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/ui/app-icon';
import { Colors, Typography } from '@/constants/theme';

export default function TermsScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <AppIcon name="back" onPress={() => router.back()} />
        <Text style={styles.title}>서비스 이용약관</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.updated}>최종 업데이트: 2026년 4월 1일</Text>

        <Section title="제1조 (목적)">
          {`본 약관은 LinClean(이하 "서비스")이 제공하는 URL 보안 분석 및 링크 관리 서비스의 이용 조건 및 절차, 회사와 이용자 간의 권리·의무 및 책임 사항을 규정함을 목적으로 합니다.`}
        </Section>

        <Section title="제2조 (서비스 제공)">
          {`서비스는 사용자가 입력한 URL의 보안 위험도를 분석하고, 안전한 링크를 저장·관리할 수 있는 기능을 제공합니다. 서비스의 세부 내용은 운영 정책에 따라 변경될 수 있습니다.`}
        </Section>

        <Section title="제3조 (이용자의 의무)">
          {`이용자는 서비스 이용 시 관계 법령을 준수해야 하며, 타인의 정보를 무단으로 수집하거나 서비스를 악용하는 행위를 해서는 안 됩니다.`}
        </Section>

        <Section title="제4조 (서비스 변경 및 중단)">
          {`회사는 운영상·기술상 필요에 따라 서비스를 변경하거나 중단할 수 있으며, 이 경우 사전에 공지합니다. 단, 불가피한 사유가 있을 경우 사후 공지할 수 있습니다.`}
        </Section>

        <Section title="제5조 (면책)">
          {`회사는 천재지변, 네트워크 장애 등 불가항력으로 인한 서비스 중단에 대해 책임을 지지 않습니다. 또한 URL 분석 결과는 참고용이며, 최종 판단은 이용자 본인에게 있습니다.`}
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
