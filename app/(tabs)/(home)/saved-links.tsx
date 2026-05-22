import { useState, useMemo, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { AppIcon } from '@/components/ui/app-icon';
import { BookmarkChip } from '@/components/ui/bookmark-chip';
import { CardLink } from '@/components/ui/card-link';
import { FilterChip, type FilterChipItem } from '@/components/ui/filter-chip';
import { FolderContextMenu, type ContextMenuItem } from '@/components/ui/folder-context-menu';
import { TitleEditModal } from '@/components/ui/title-edit-modal';
import { Toast } from '@/components/ui/toast';
import type { AnchorPosition } from '@/components/ui/folder-card';
import { Colors, Typography } from '@/constants/theme';
import { getSavedLinkErrorMessage, useSavedLinks, type SavedLink } from '@/context/saved-links-context';

// ─── 폴더 필터 칩 아이템 ──────────────────────────────────────────────────────
// 실제 구현 시 GET /api/v1/categories 응답으로 교체

// 폴더명은 folder/index.tsx MOCK_FOLDERS와 동일하게 유지 (API 연동 시 GET /categories로 교체)
const FOLDER_ITEMS: FilterChipItem[] = [
  { label: '전체', value: 'all' },
  { label: '맛집 정보', value: '1' },
  { label: '취업', value: '2' },
  { label: '취미', value: '3' },
];

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SavedLinksScreen() {
  const {
    links,
    isLoading,
    isLoadingMore,
    errorMessage,
    hasNext,
    refreshLinks,
    loadMoreLinks,
    toggleBookmark,
    deleteLink,
    updateTitle,
  } = useSavedLinks();

  const [selectedFolder, setSelectedFolder] = useState('all');
  const [bookmarkFilter, setBookmarkFilter] = useState(false);

  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<AnchorPosition | undefined>();
  const [menuItems, setMenuItems] = useState<ContextMenuItem[]>([]);
  const [editingLink, setEditingLink] = useState<SavedLink | null>(null);
  const [deleteToastVisible, setDeleteToastVisible] = useState(false);
  const [titleToastVisible, setTitleToastVisible] = useState(false);

  const displayLinks = useMemo(() => {
    const folderFiltered =
      selectedFolder === 'all'
        ? links
        : links.filter((link) => String(link.categoryId) === selectedFolder);

    if (!bookmarkFilter) {
      return folderFiltered;
    }

    return folderFiltered.filter((link) => link.isBookmarked);
  }, [links, selectedFolder, bookmarkFilter]);

  const openTitleModal = useCallback((link: SavedLink) => {
    setEditingLink(link);
  }, []);

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
    [deleteLink],
  );

  const openMoreMenu = useCallback(
    (link: SavedLink, anchor: AnchorPosition) => {
      setMenuAnchor(anchor);
      setMenuItems([
        {
          label: '제목 수정',
          onPress: () => openTitleModal(link),
        },
        {
          label: '링크 삭제',
          onPress: () => handleDelete(link.id),
          destructive: true,
        },
      ]);
      setMenuVisible(true);
    },
    [handleDelete, openTitleModal],
  );

  const handleTitleConfirm = useCallback(async (id: number, title: string) => {
    await updateTitle(id, title);
    setTitleToastVisible(true);
  }, [updateTitle]);

  const showEmptyState = !isLoading && displayLinks.length === 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* 헤더 */}
      <View style={styles.header}>
        <AppIcon name="back" size={24} onPress={() => router.back()} />
        <Text style={styles.title}>저장한 링크</Text>
      </View>

      {/* 필터 칩 */}
      <View style={styles.chipRow}>
        <FilterChip
          variant="active"
          items={FOLDER_ITEMS}
          selectedValue={selectedFolder}
          onSelect={setSelectedFolder}
        />
        <BookmarkChip
          variant={bookmarkFilter ? 'active' : 'inactive'}
          onPress={() => setBookmarkFilter((prev) => !prev)}
        />
      </View>

      {errorMessage ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}

      {/* 링크 목록 */}
      <FlatList
        data={displayLinks}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => {
              void refreshLinks();
            }}
            tintColor={Colors.brand.primary}
          />
        }
        onEndReached={() => {
          if (hasNext && !isLoadingMore) {
            void loadMoreLinks();
          }
        }}
        onEndReachedThreshold={0.4}
        renderItem={({ item }) => (
          <CardLink
            verdict={item.verdict}
            title={item.title}
            originalUrl={item.originalUrl}
            finalUrl={item.finalUrl}
            bookmarked={item.isBookmarked}
            onBookmark={() => {
              void handleBookmark(item.id);
            }}
            onMore={(anchor) => openMoreMenu(item, anchor)}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          showEmptyState ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>저장한 링크가 없어요</Text>
              <Text style={styles.emptySubtext}>검사 결과 화면에서 안전한 링크를 저장해보세요</Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          isLoadingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator color={Colors.brand.primary} />
            </View>
          ) : null
        }
      />

      {/* 링크 컨텍스트 메뉴 */}
      <FolderContextMenu
        visible={menuVisible}
        anchor={menuAnchor}
        items={menuItems}
        onDismiss={() => setMenuVisible(false)}
      />

      <TitleEditModal
        editingLink={editingLink}
        onConfirm={handleTitleConfirm}
        onClose={() => setEditingLink(null)}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  title: {
    ...Typography.title,
    color: Colors.brand.text,
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    zIndex: 10,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 32,
  },
  separator: {
    height: 12,
  },
  errorBox: {
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.brand.textWarning,
    backgroundColor: Colors.brand.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.brand.textWarning,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingBottom: 80,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.brand.textSecondary,
  },
  emptySubtext: {
    ...Typography.caption,
    color: Colors.brand.textHint,
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: 'center',
  },
});
