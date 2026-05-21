import { useState, useMemo, useCallback, useRef } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { AppIcon } from '@/components/ui/app-icon';
import { BookmarkChip } from '@/components/ui/bookmark-chip';
import { CardLink } from '@/components/ui/card-link';
import { FilterChip, type FilterChipItem } from '@/components/ui/filter-chip';
import { FolderContextMenu, type ContextMenuItem } from '@/components/ui/folder-context-menu';
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
  const [titleValue, setTitleValue] = useState('');
  const [isUpdatingTitle, setIsUpdatingTitle] = useState(false);
  const titleInputRef = useRef<TextInput>(null);

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
    setTitleValue(link.title);
    setTimeout(() => titleInputRef.current?.focus(), 100);
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

  const handleTitleCancel = useCallback(() => {
    if (isUpdatingTitle) {
      return;
    }

    setEditingLink(null);
    setTitleValue('');
  }, [isUpdatingTitle]);

  const handleTitleConfirm = useCallback(async () => {
    const trimmedTitle = titleValue.trim();

    if (!editingLink || trimmedTitle.length === 0 || trimmedTitle.length > 500 || isUpdatingTitle) {
      return;
    }

    setIsUpdatingTitle(true);

    try {
      await updateTitle(editingLink.id, trimmedTitle);
      setEditingLink(null);
      setTitleValue('');
    } catch (error) {
      Alert.alert(
        '제목 수정 실패',
        getSavedLinkErrorMessage(error, '제목을 수정하지 못했습니다. 잠시 후 다시 시도해주세요.'),
      );
    } finally {
      setIsUpdatingTitle(false);
    }
  }, [editingLink, isUpdatingTitle, titleValue, updateTitle]);

  const titleSubmitDisabled = titleValue.trim().length === 0 || titleValue.trim().length > 500 || isUpdatingTitle;
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

      {/* 링크 제목 수정 모달 */}
      <Modal
        visible={editingLink !== null}
        transparent
        animationType="fade"
        onRequestClose={handleTitleCancel}
      >
        <KeyboardAvoidingView
          style={renameStyles.overlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Pressable style={renameStyles.backdrop} onPress={handleTitleCancel} />
          <View style={renameStyles.sheet}>
            <Text style={renameStyles.sheetTitle}>제목 수정</Text>
            <View style={renameStyles.inputRow}>
              <TextInput
                ref={titleInputRef}
                style={renameStyles.input}
                value={titleValue}
                onChangeText={setTitleValue}
                placeholder="URL 제목 입력"
                placeholderTextColor={Colors.brand.textHint}
                returnKeyType="done"
                onSubmitEditing={handleTitleConfirm}
                maxLength={500}
                editable={!isUpdatingTitle}
                autoFocus
              />
              {titleValue.length > 0 && !isUpdatingTitle && (
                <TouchableOpacity
                  onPress={() => setTitleValue('')}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={renameStyles.clearButton}
                >
                  <Text style={renameStyles.clearButtonText}>×</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={renameStyles.actions}>
              <TouchableOpacity
                style={renameStyles.cancelBtn}
                onPress={handleTitleCancel}
                disabled={isUpdatingTitle}
              >
                <Text style={renameStyles.cancelText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[renameStyles.confirmBtn, titleSubmitDisabled && renameStyles.confirmBtnDisabled]}
                onPress={handleTitleConfirm}
                disabled={titleSubmitDisabled}
              >
                <Text style={[renameStyles.confirmText, titleSubmitDisabled && renameStyles.confirmTextDisabled]}>
                  {isUpdatingTitle ? '저장 중...' : '저장'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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

const renameStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.brand.overlayBackdrop,
  },
  sheet: {
    backgroundColor: Colors.brand.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
    gap: 16,
  },
  sheetTitle: {
    ...Typography.section,
    color: Colors.brand.text,
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.brand.line,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    ...Typography.body,
    color: Colors.brand.text,
    padding: 0,
  },
  clearButton: {
    marginLeft: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.brand.softMint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButtonText: {
    ...Typography.caption,
    color: Colors.brand.primary,
    lineHeight: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.brand.line,
    alignItems: 'center',
  },
  cancelText: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.brand.textSecondary,
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.brand.primary,
    alignItems: 'center',
  },
  confirmBtnDisabled: {
    backgroundColor: Colors.brand.softMint,
  },
  confirmText: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.brand.onPrimary,
  },
  confirmTextDisabled: {
    color: Colors.brand.textHint,
  },
});
