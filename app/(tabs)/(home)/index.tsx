import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { AppIcon } from '@/components/ui/app-icon';
import { CardLink } from '@/components/ui/card-link';
import { FolderContextMenu } from '@/components/ui/folder-context-menu';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SectionHeader } from '@/components/ui/section-header';
import { Colors, Typography } from '@/constants/theme';
import { useSavedLinks } from '@/context/saved-links-context';
import type { AnchorPosition } from '@/components/ui/folder-card';

export default function HomeScreen() {
  const { links, toggleBookmark, deleteLink } = useSavedLinks();
  const [menuState, setMenuState] = useState<{ visible: boolean; anchor?: AnchorPosition; linkId?: number }>({ visible: false });

  // 최근 저장한 링크 — createdAt 내림차순 상위 3개
  const recentLinks = links.slice(0, 3);

  const handleMore = (id: number, anchor: AnchorPosition) => {
    setMenuState({ visible: true, anchor, linkId: id });
  };

  const selectedLink = links.find((l) => l.id === menuState.linkId);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* 상단 헤더 */}
        <View style={styles.header}>
          <View style={styles.wordmark}>
            <IconSymbol
              name="checkmark.shield.fill"
              size={28}
              color={Colors.brand.primary}
            />
            <Text style={styles.brandText}>LinClean</Text>
          </View>
          <AppIcon name="settings" size={28} label="설정" onPress={() => router.push('/(tabs)/(home)/settings')} />
        </View>

        {/* 서브타이틀 */}
        <Text style={styles.subtitle}>오늘도 안전하게 정리해요</Text>

        {/* 보안 등급별 링크 현황 */}
        <View style={styles.section}>
          <SectionHeader label="보안 등급별 링크 현황" />
          <View style={styles.statPlaceholder}>
            <View style={styles.statGrid}>
              <View style={styles.statItem} />
              <View style={styles.statItem} />
              <View style={styles.statItem} />
              <View style={styles.statItem} />
            </View>
          </View>
        </View>

        {/* 최근 저장한 링크 */}
        <View style={styles.section}>
          <SectionHeader
            label="최근 저장한 링크"
            onViewAll={() => router.push('/saved-links')}
          />
          <View style={styles.linkList}>
            {recentLinks.map((link) => (
              <CardLink
                key={link.id}
                verdict={link.verdict}
                title={link.title}
                url={link.originalUrl}
                originalUrl={link.originalUrl}
                finalUrl={link.finalUrl}
                bookmarked={link.isBookmarked}
                onBookmark={() => toggleBookmark(link.id)}
                onMore={(anchor) => handleMore(link.id, anchor)}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <FolderContextMenu
        visible={menuState.visible}
        anchor={menuState.anchor}
        items={[
          {
            label: selectedLink?.isBookmarked ? '북마크 제거' : '북마크 추가',
            onPress: () => menuState.linkId != null && toggleBookmark(menuState.linkId),
          },
          {
            label: '링크 삭제',
            onPress: () => menuState.linkId != null && deleteLink(menuState.linkId),
            destructive: true,
          },
        ]}
        onDismiss={() => setMenuState({ visible: false })}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.brand.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 25,
    paddingBottom: 32,
    gap: 24,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
  },
  wordmark: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandText: {
    ...Typography.title,
    color: Colors.brand.primary,
  },

  subtitle: {
    ...Typography.caption,
    color: Colors.brand.textSecondary,
    marginTop: -16,
  },

  section: {
    gap: 12,
  },

  statPlaceholder: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.brand.line,
    padding: 16,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    height: 56,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.brand.line,
    borderStyle: 'dashed',
  },

  linkList: {
    gap: 12,
  },
});
