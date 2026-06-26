import { useCallback, useRef, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';

import { Button } from '@/components/ui/button';
import { SelectableLinkCard } from '@/components/ui/selectable-link-card';
import { Colors, Typography } from '@/constants/theme';
import { getFolderErrorMessage, useFolders } from '@/context/folders-context';
import { useSavedLinks } from '@/context/saved-links-context';
import { showAlert } from '@/utils/guarded-alert';
import { markPerformance, measurePerformance } from '@/utils/performance-trace';

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function FolderAddUrlScreen() {
  const { folderId, folderName } = useLocalSearchParams<{
    folderId: string;
    folderName: string;
  }>();
  const { links, assignCategory } = useSavedLinks();
  const { refreshFolders } = useFolders();

  // 미분류 URL만 표시 (categoryId === null)
  const uncategorizedLinks = links.filter((l) => l.categoryId === null);

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isAdding, setIsAdding] = useState(false);
  const isAddingRef = useRef(false);

  const toggleSelect = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleAdd = async () => {
    if (isAddingRef.current || selectedIds.size === 0) return;
    const selectedLinkIds = [...selectedIds];
    isAddingRef.current = true;
    setIsAdding(true);
    markPerformance('folder_add_button_pressed');
    try {
      markPerformance('folder_assign_started');
      await assignCategory(selectedLinkIds, Number(folderId));
      measurePerformance('folder_assign_completed', 'folder_assign_started');
      markPerformance('folder_detail_navigation_started');
      router.replace({
        pathname: '/(tabs)/(folder)/[id]',
        params: {
          id: folderId,
          urlAdded: '1',
          addedLinkIds: selectedLinkIds.join(','),
        },
      });
      markPerformance('folder_refresh_after_navigation_started');
      void refreshFolders()
        .catch(() => undefined)
        .finally(() => {
          measurePerformance(
            'folder_refresh_completed_after_navigation',
            'folder_refresh_after_navigation_started',
          );
        });
    } catch (error) {
      showAlert(
        'URL 추가 실패',
        getFolderErrorMessage(error, '선택한 URL을 폴더에 추가하지 못했습니다. 잠시 후 다시 시도해주세요.'),
      );
    } finally {
      isAddingRef.current = false;
      setIsAdding(false);
    }
  };

  const selectedCount = selectedIds.size;
  const name = folderName ?? '폴더';

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'URL 추가',
          headerBackTitle: '',
          headerTransparent: false,
          headerStyle: { backgroundColor: Colors.brand.background },
          headerTitleStyle: {
            ...Typography.title,
            color: Colors.brand.text,
          },
          headerTintColor: Colors.brand.text,
          headerShadowVisible: false,
        }}
      />

      <View style={styles.container}>
        {/* ── 폴더명 표시 ── */}
        <View style={styles.folderNameRow}>
          <Text style={styles.folderNameLabel}>추가할 폴더</Text>
          <View style={styles.chip}>
            <Text style={styles.chipText}>{name}</Text>
          </View>
        </View>

        {/* ── 섹션 타이틀 ── */}
        <Text style={styles.sectionTitle}>폴더에 담기지 않은 URL</Text>

        {/* ── URL 리스트 ── */}
        {uncategorizedLinks.length > 0 ? (
          <FlatList
            data={uncategorizedLinks}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <SelectableLinkCard
                link={item}
                selected={selectedIds.has(item.id)}
                onToggle={toggleSelect}
              />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>담기지 않은 URL이 없어요</Text>
            <Text style={styles.emptySubtext}>모든 URL이 이미 폴더에 분류되어 있어요</Text>
          </View>
        )}

        {/* ── 하단 액션 바 ── */}
        <View style={styles.bottomBar}>
          <View style={styles.countBlock}>
            <Text style={styles.countLabel}>선택한 URL</Text>
            <Text style={styles.countNumber}>{selectedCount}개</Text>
          </View>
          <View style={styles.addButtonWrap}>
            <Button
              label="추가하기"
              variant="primary"
              size="large"
              onPress={handleAdd}
              loading={isAdding}
              disabled={isAdding || selectedCount === 0}
            />
          </View>
        </View>
      </View>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.brand.background,
  },

  folderNameRow: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    gap: 8,
  },
  folderNameLabel: {
    ...Typography.caption,
    color: Colors.brand.text,
  },
  chip: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.brand.softMint,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipText: {
    ...Typography.title,
    color: Colors.brand.primaryDeep,
  },

  sectionTitle: {
    ...Typography.section,
    color: Colors.brand.text,
    paddingHorizontal: 20,
    marginBottom: 12,
  },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  separator: {
    height: 8,
  },

  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingBottom: 60,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.brand.textSecondary,
  },
  emptySubtext: {
    ...Typography.caption,
    color: Colors.brand.textHint,
  },

  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.brand.line,
    backgroundColor: Colors.brand.surface,
    gap: 16,
  },
  countBlock: {
    gap: 2,
  },
  countLabel: {
    ...Typography.caption,
    color: Colors.brand.textSecondary,
  },
  countNumber: {
    ...Typography.title,
    color: Colors.brand.text,
  },
  addButtonWrap: {
    flex: 1,
  },
});
