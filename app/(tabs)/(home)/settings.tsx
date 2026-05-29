import { useAuth } from '@clerk/expo';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ApiError } from '@/api/api-client';
import { withdrawMember } from '@/api/members';
import { AppIcon } from '@/components/ui/app-icon';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Typography } from '@/constants/theme';
import { showAlert } from '@/utils/guarded-alert';
import { useGuardedPress } from '@/utils/press-guard';

const version = Constants.expoConfig?.version ?? '—';
type LoginNotice = 'withdrawal-complete' | 'session-expired';

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
  const guardedOnPress = useGuardedPress(onPress, { disabled: !onPress });

  return (
    <TouchableOpacity
      style={styles.row}
      onPress={guardedOnPress}
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
  const { getToken, signOut } = useAuth();
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const isWithdrawingRef = useRef(false);
  const isLoggingOutRef = useRef(false);

  function handleLogout() {
    if (isLoggingOutRef.current) {
      return;
    }

    showAlert('로그아웃', '로그아웃하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: async () => {
          if (isLoggingOutRef.current) {
            return;
          }

          isLoggingOutRef.current = true;
          setIsLoggingOut(true);

          try {
            await signOut();
            router.replace('/(auth)/login');
          } catch (error) {
            console.error(error);
            isLoggingOutRef.current = false;
            setIsLoggingOut(false);
            showAlert('로그아웃 실패', '로그아웃 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.');
          }
        },
      },
    ]);
  }

  function handleWithdraw() {
    if (isWithdrawingRef.current) {
      return;
    }

    showAlert(
      '회원탈퇴',
      '회원탈퇴하시겠습니까? 탈퇴 후에는 현재 계정으로 서비스를 이용할 수 없습니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '회원탈퇴',
          style: 'destructive',
          onPress: withdrawAccount,
        },
      ],
    );
  }

  async function withdrawAccount() {
    if (isWithdrawingRef.current) {
      return;
    }

    isWithdrawingRef.current = true;
    setIsWithdrawing(true);

    try {
      await withdrawMember(getToken);
      await signOutSafely();
      goToLoginWithNotice('withdrawal-complete');
    } catch (error) {
      console.error(error);

      if (error instanceof ApiError && error.status === 401) {
        await signOutSafely();
        goToLoginWithNotice('session-expired');
        return;
      }

      isWithdrawingRef.current = false;
      setIsWithdrawing(false);
      showAlert(
        '회원탈퇴 실패',
        '회원탈퇴 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.',
      );
    }
  }

  async function signOutSafely() {
    try {
      await signOut();
    } catch (signOutError) {
      console.error(signOutError);
    }
  }

  function goToLoginWithNotice(notice: LoginNotice) {
    router.replace({
      pathname: '/(auth)/login',
      params: { notice },
    });
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
          <SettingRow
            label="로그아웃"
            rightText={isLoggingOut ? '처리 중' : undefined}
            onPress={isLoggingOut ? undefined : handleLogout}
          />
          <View style={styles.divider} />
          <SettingRow
            label="회원탈퇴"
            destructive
            rightText={isWithdrawing ? '처리 중' : undefined}
            onPress={isWithdrawing ? undefined : handleWithdraw}
          />
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
    backgroundColor: Colors.brand.surface,
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
