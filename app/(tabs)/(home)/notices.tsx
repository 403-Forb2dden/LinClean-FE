import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/ui/app-icon';
import { Colors, Typography } from '@/constants/theme';

// TODO: 공지사항 목록은 추후 GET /api/v1/notices API 연동으로 대체
// TODO: 공지사항 상세 화면 추가 시 선택한 공지는 GET /api/v1/notices/{id} API 연동으로 조회
const PLACEHOLDER_NOTICES: { id: number; title: string; date: string; isPinned: boolean }[] = [
  { id: 1, title: 'LinClean 서비스 오픈 안내', date: '2026.04.01', isPinned: true },
  { id: 2, title: '개인정보 처리방침 개정 안내', date: '2026.03.15', isPinned: false },
];

export default function NoticesScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <AppIcon name="back" onPress={() => router.back()} />
        <Text style={styles.title}>공지사항</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {PLACEHOLDER_NOTICES.map((notice, index) => (
          <TouchableOpacity
            key={notice.id}
            style={[styles.noticeItem, index < PLACEHOLDER_NOTICES.length - 1 && styles.noticeItemBorder]}
            activeOpacity={0.7}
          >
            <View style={styles.noticeTop}>
              {notice.isPinned && (
                <View style={styles.pinnedBadge}>
                  <Text style={styles.pinnedText}>공지</Text>
                </View>
              )}
              <Text style={styles.noticeTitle}>{notice.title}</Text>
            </View>
            <Text style={styles.noticeDate}>{notice.date}</Text>
          </TouchableOpacity>
        ))}

        {PLACEHOLDER_NOTICES.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>공지사항이 없습니다.</Text>
          </View>
        )}
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
    marginHorizontal: 24,
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.brand.line,
    overflow: 'hidden',
    marginTop: 8,
  },
  noticeItem: {
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 6,
  },
  noticeItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.brand.line,
  },
  noticeTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  pinnedBadge: {
    backgroundColor: Colors.brand.softMint,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  pinnedText: {
    ...Typography.bold12,
    color: Colors.brand.primaryDeep,
  },
  noticeTitle: {
    ...Typography.profile,
    color: Colors.brand.text,
    flex: 1,
  },
  noticeDate: {
    ...Typography.summary,
    color: Colors.brand.textHint,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.brand.textHint,
  },
});
