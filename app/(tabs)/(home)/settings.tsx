import Constants from 'expo-constants';
import { router } from 'expo-router';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/ui/app-icon';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Typography } from '@/constants/theme';

const version = Constants.expoConfig?.version ?? '—';

function SectionLabel({ label }: { label: string }) {
  return <Text style={styles.sectionLabel}>{label}</Text>;
}

interface SettingRowProps {
  label: string;
  onPress?: () => void;
  rightText?: string;
  destructive?: boolean;
  showChevron?: boolean;
}

function SettingRow({ label, onPress, rightText, destructive = false, showChevron = false }: SettingRowProps) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <Text style={[styles.rowLabel, destructive && styles.rowLabelDestructive]}>{label}</Text>
      <View style={styles.rowRight}>
        {rightText != null && <Text style={styles.rowRightText}>{rightText}</Text>}
        {showChevron && (
          <IconSymbol name="chevron.right" size={16} color={Colors.brand.textHint} />
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  function handleLogout() {
    Alert.alert('로그아웃', '로그아웃하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        style: 'destructive',
        // TODO: auth 토큰 삭제 후 로그인 화면으로 이동
        onPress: () => router.replace('/login' as any),
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <AppIcon name="back" onPress={() => router.back()} />
        <Text style={styles.title}>설정</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

        <SectionLabel label="공지" />
        <View style={styles.group}>
          <SettingRow
            label="공지사항"
            showChevron
            onPress={() => router.push('/(tabs)/(home)/notices')}
          />
        </View>

        {/* 서비스 정보 */}
        <SectionLabel label="서비스 정보" />
        <View style={styles.group}>
          <SettingRow label="버전 정보" rightText={`v${version}`} />
          <View style={styles.divider} />
          <SettingRow
            label="서비스 이용약관"
            showChevron
            onPress={() => router.push('/(tabs)/(home)/terms')}
          />
          <View style={styles.divider} />
          <SettingRow
            label="개인정보 처리방침"
            showChevron
            onPress={() => router.push('/(tabs)/(home)/privacy')}
          />
        </View>

        {/* 도움말 */}
        <SectionLabel label="도움말" />
        <View style={styles.group}>
          <SettingRow
            label="서비스 이용방법"
            showChevron
            onPress={() => router.push('/(tabs)/(home)/how-to-use')}
          />
        </View>

        {/* 계정 */}
        <SectionLabel label="계정" />
        <View style={styles.group}>
          <SettingRow label="로그아웃" onPress={handleLogout} />
          <View style={styles.divider} />
          <SettingRow label="회원탈퇴" destructive />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.brand.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    ...Typography.title,
    color: Colors.brand.text,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 4,
    paddingBottom: 40,
    gap: 8,
  },
  sectionLabel: {
    ...Typography.caption,
    color: Colors.brand.textHint,
    marginTop: 12,
  },
  group: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.brand.line,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    minHeight: 56,
  },
  rowLabel: {
    ...Typography.profile,
    color: Colors.brand.text,
  },
  rowLabelDestructive: {
    color: Colors.brand.textWarning,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rowRightText: {
    ...Typography.summary,
    color: Colors.brand.textHint,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.brand.line,
    marginHorizontal: 18,
  },
});
