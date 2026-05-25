import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { AppIcon } from '@/components/ui/app-icon';
import { CardLink } from '@/components/ui/card-link';
import { FolderContextMenu } from '@/components/ui/folder-context-menu';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SectionHeader } from '@/components/ui/section-header';
import { TitleEditModal } from '@/components/ui/title-edit-modal';
import { Toast } from '@/components/ui/toast';
import { Colors, Typography } from '@/constants/theme';
import { useFolders } from '@/context/folders-context';
import { getSavedLinkErrorMessage, useSavedLinks, type SavedLink } from '@/context/saved-links-context';
import type { AnchorPosition } from '@/components/ui/folder-card';

const COMPACT_WIDTH = 380;

export default function HomeScreen() {
  const { savedLinkToast: savedLinkToastParam } = useLocalSearchParams<{
    savedLinkToast?: string | string[];
  }>();
  const { width: windowWidth } = useWindowDimensions();
  const tabBarHeight = useBottomTabBarHeight();
  const { links, toggleBookmark, deleteLink, updateTitle } = useSavedLinks();
  const { refreshFolders } = useFolders();
  const [menuState, setMenuState] = useState<{ visible: boolean; anchor?: AnchorPosition; linkId?: number }>({ visible: false });
  const [editingLink, setEditingLink] = useState<SavedLink | null>(null);
  const [saveToastVisible, setSaveToastVisible] = useState(false);
  const [deleteToastVisible, setDeleteToastVisible] = useState(false);
  const [titleToastVisible, setTitleToastVisible] = useState(false);
  const lastToastParamRef = useRef<string | undefined>(undefined);
  const savedLinkToast = typeof savedLinkToastParam === 'string' ? savedLinkToastParam : undefined;
  const isCompactWidth = windowWidth < COMPACT_WIDTH;

  // 최근 저장한 링크 — createdAt 내림차순 상위 3개
  const recentLinks = links.slice(0, 3);

  useEffect(() => {
    if (!savedLinkToast || lastToastParamRef.current === savedLinkToast) {
      return;
    }

    lastToastParamRef.current = savedLinkToast;
    setSaveToastVisible(true);
  }, [savedLinkToast]);

  const handleMore = (id: number, anchor: AnchorPosition) => {
    setMenuState({ visible: true, anchor, linkId: id });
  };

  const selectedLink = links.find((l) => l.id === menuState.linkId);

  const handleBookmark = useCallback(
    async (id: number) => {
      try {
        await toggleBookmark(id);
      } catch (error) {
        Alert.alert(
          '북마크 변경 실패',
          getSavedLinkErrorMessage(error, '북마크 상태를 변경하지 못했습니다. 잠시 후 다시 시도해주세요.'),
        );
      }
    },
    [toggleBookmark],
  );

  const handleDelete = useCallback(
    (id: number) => {
      Alert.alert('링크 삭제', '저장한 링크를 삭제할까요?', [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteLink(id);
              await refreshFolders();
              setDeleteToastVisible(true);
            } catch (error) {
              Alert.alert(
                '삭제 실패',
                getSavedLinkErrorMessage(error, '링크를 삭제하지 못했습니다. 잠시 후 다시 시도해주세요.'),
              );
            }
          },
        },
      ]);
    },
    [deleteLink, refreshFolders],
  );

  const openTitleModal = useCallback((link: SavedLink) => {
    setEditingLink(link);
  }, []);

  const handleTitleConfirm = useCallback(async (id: number, title: string) => {
    await updateTitle(id, title);
    setTitleToastVisible(true);
  }, [updateTitle]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          isCompactWidth && styles.contentCompact,
          { paddingBottom: tabBarHeight + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* 상단 헤더 */}
        <View style={styles.header}>
          <View style={styles.wordmark}>
            <IconSymbol
              name="checkmark.shield.fill"
              size={30}
              color={Colors.brand.primary}
            />
            <Text style={[styles.brandText, isCompactWidth && styles.brandTextCompact]}>LinClean</Text>
          </View>
          <AppIcon name="settings" size={28} label="설정" onPress={() => router.push('/(tabs)/(home)/settings')} />
        </View>

        {/* 서브타이틀 */}
        <Text style={[styles.subtitle, isCompactWidth && styles.subtitleCompact]}>오늘도 안전하게 정리해요</Text>

        {/* 보안 등급별 링크 현황 */}
        <View style={styles.section}>
          <SectionHeader label="보안 등급별 링크 현황" compact={isCompactWidth} />
          <View style={[styles.statPlaceholder, isCompactWidth && styles.statPlaceholderCompact]}>
            <View style={[styles.statGrid, isCompactWidth && styles.statGridCompact]}>
              <View style={[styles.statItem, isCompactWidth && styles.statItemCompact]} />
              <View style={[styles.statItem, isCompactWidth && styles.statItemCompact]} />
              <View style={[styles.statItem, isCompactWidth && styles.statItemCompact]} />
              <View style={[styles.statItem, isCompactWidth && styles.statItemCompact]} />
            </View>
          </View>
        </View>

        {/* 최근 저장한 링크 */}
        <View style={styles.section}>
          <SectionHeader
            label="최근 저장한 링크"
            onViewAll={() => router.push('/saved-links')}
            compact={isCompactWidth}
          />
          <View style={styles.linkList}>
            {recentLinks.map((link) => (
              <CardLink
                key={link.id}
                verdict={link.verdict}
                title={link.title}
                originalUrl={link.originalUrl}
                finalUrl={link.finalUrl}
                bookmarked={link.isBookmarked}
                onBookmark={() => {
                  void handleBookmark(link.id);
                }}
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
            label: '제목 수정',
            onPress: () => selectedLink && openTitleModal(selectedLink),
          },
          {
            label: '링크 삭제',
            onPress: () => menuState.linkId != null && handleDelete(menuState.linkId),
            destructive: true,
          },
        ]}
        onDismiss={() => setMenuState({ visible: false })}
      />

      <TitleEditModal
        editingLink={editingLink}
        onConfirm={handleTitleConfirm}
        onClose={() => setEditingLink(null)}
      />

      <Toast
        visible={saveToastVisible}
        message="링크가 저장되었습니다."
        placement="top"
        topOffset={96}
        onHide={() => setSaveToastVisible(false)}
      />
      <Toast
        visible={deleteToastVisible}
        message="링크가 삭제되었습니다."
        placement="top"
        topOffset={96}
        onHide={() => setDeleteToastVisible(false)}
      />
      <Toast
        visible={titleToastVisible}
        message="제목이 수정되었습니다."
        placement="top"
        topOffset={96}
        onHide={() => setTitleToastVisible(false)}
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
  contentCompact: {
    paddingHorizontal: 20,
    gap: 18,
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
    ...Typography.displayMedium,
    color: Colors.brand.primary,
  },
  brandTextCompact: {
    ...Typography.pageTitle,
  },

  subtitle: {
    ...Typography.caption,
    color: Colors.brand.textSecondary,
    marginTop: -16,
  },
  subtitleCompact: {
    marginTop: -10,
  },

  section: {
    gap: 12,
  },

  statPlaceholder: {
    backgroundColor: Colors.brand.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.brand.line,
    padding: 16,
  },
  statPlaceholderCompact: {
    padding: 14,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statGridCompact: {
    gap: 10,
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
  statItemCompact: {
    height: 48,
  },

  linkList: {
    gap: 12,
  },
});
