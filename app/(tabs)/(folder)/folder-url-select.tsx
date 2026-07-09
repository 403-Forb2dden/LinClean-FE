import { useCallback, useRef, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { ScreenHeader } from '@/components/ui/screen-header';
import { SelectableLinkCard } from '@/components/ui/selectable-link-card';
import { Colors, Typography } from '@/constants/theme';
import { getFolderErrorMessage, useFolders } from '@/context/folders-context';
import { useSavedLinks } from '@/context/saved-links-context';
import { showAlert } from '@/utils/guarded-alert';

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function FolderUrlSelectScreen() {
  const { folderName } = useLocalSearchParams<{ folderName: string }>();
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isCreating, setIsCreating] = useState(false);
  const { addFolder } = useFolders();
  const { links: allLinks, refreshLinks } = useSavedLinks();
  const links = allLinks.filter((l) => l.categoryId === null);
  const name = (folderName ?? '새 폴더').trim();
  const isCreatingRef = useRef(false);

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

  const handleCreate = async () => {
    if (isCreatingRef.current) return;
    isCreatingRef.current = true;
    setIsCreating(true);
    try {
      await addFolder(name, [...selectedIds]);
    } catch (error) {
      showAlert(
        '폴더 생성 실패',
        getFolderErrorMessage(error, '폴더를 생성하지 못했습니다. 잠시 후 다시 시도해주세요.'),
      );
      isCreatingRef.current = false;
      setIsCreating(false);
      return;
    }

    try {
      await refreshLinks();
    } catch {
      // Link refresh is best-effort after the folder has already been created.
    }

    router.dismissAll();
    router.replace({
      pathname: '/(tabs)/(folder)',
      params: { folderCreated: String(Date.now()) },
    });
    isCreatingRef.current = false;
    setIsCreating(false);
  };

  const selectedCount = selectedIds.size;

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/(folder)');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader title="새 폴더 만들기" onBack={handleBack} />
        {/* ── 폴더명 표시 ── */}
        <View style={styles.folderNameRow}>
          <Text style={styles.folderNameLabel}>현재 폴더명</Text>
          <View style={styles.chip}>
            <Text style={styles.chipText}>{name}</Text>
          </View>
        </View>

        {/* ── 섹션 타이틀 ── */}
        <Text style={styles.sectionTitle}>폴더에 담기지 않은 URL</Text>

        {/* ── URL 리스트 ── */}
        {links.length > 0 ? (
          <FlatList
            data={links}
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
          <View style={styles.createButtonWrap}>
            <Button
              label="생성하기"
              variant="primary"
              size="large"
              onPress={handleCreate}
              loading={isCreating}
              disabled={isCreating}
            />
          </View>
        </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.brand.background,
  },

  // Folder name display
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

  // Section title
  sectionTitle: {
    ...Typography.section,
    color: Colors.brand.text,
    paddingHorizontal: 20,
    marginBottom: 12,
  },

  // List
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

  // Bottom action bar
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
  createButtonWrap: {
    flex: 1,
  },
});
