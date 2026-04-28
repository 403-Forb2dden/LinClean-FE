import { useState, useMemo, useCallback } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { AppIcon } from '@/components/ui/app-icon';
import { BookmarkChip } from '@/components/ui/bookmark-chip';
import { CardLink } from '@/components/ui/card-link';
import { FilterChip, type FilterChipItem } from '@/components/ui/filter-chip';
import { FolderContextMenu, type ContextMenuItem } from '@/components/ui/folder-context-menu';
import type { AnchorPosition } from '@/components/ui/folder-card';
import { Colors, Typography } from '@/constants/theme';
import { useSavedLinks, type SavedLink } from '@/context/saved-links-context';

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
  const { links, toggleBookmark, deleteLink } = useSavedLinks();

  const [selectedFolder, setSelectedFolder] = useState('all');
  const [bookmarkFilter, setBookmarkFilter] = useState(false);

  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<AnchorPosition | undefined>();
  const [menuItems, setMenuItems] = useState<ContextMenuItem[]>([]);

  const displayLinks = useMemo(() => {
    const folderFiltered =
      selectedFolder === 'all'
        ? links
        : links.filter((link) => String(link.categoryId) === selectedFolder);

    if (!bookmarkFilter) return folderFiltered;

    return [...folderFiltered].sort((a, b) => Number(b.isBookmarked) - Number(a.isBookmarked));
  }, [links, selectedFolder, bookmarkFilter]);

  const openMoreMenu = useCallback(
    (link: SavedLink, anchor: AnchorPosition) => {
      setMenuAnchor(anchor);
      setMenuItems([
        {
          label: link.isBookmarked ? '북마크 제거' : '북마크 추가',
          onPress: () => toggleBookmark(link.id),
        },
        {
          label: '링크 삭제',
          onPress: () => deleteLink(link.id),
          destructive: true,
        },
      ]);
      setMenuVisible(true);
    },
    [toggleBookmark, deleteLink]
  );

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

      {/* 링크 목록 */}
      <FlatList
        data={displayLinks}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <CardLink
            label={item.siteName}
            title={item.title}
            summary={item.description}
            url={item.originalUrl}
            bookmarked={item.isBookmarked}
            onBookmark={() => toggleBookmark(item.id)}
            onMore={(anchor) => openMoreMenu(item, anchor)}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      {/* 링크 컨텍스트 메뉴 */}
      <FolderContextMenu
        visible={menuVisible}
        anchor={menuAnchor}
        items={menuItems}
        onDismiss={() => setMenuVisible(false)}
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
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 32,
  },
  separator: {
    height: 12,
  },
});
