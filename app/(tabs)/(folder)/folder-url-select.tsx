import { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';

import { Button } from '@/components/ui/button';
import { CardLink } from '@/components/ui/card-link';
import { SelectionCircle } from '@/components/ui/selection-circle';
import { Colors, Typography } from '@/constants/theme';
import { getFolderErrorMessage, useFolders } from '@/context/folders-context';
import { useSavedLinks, type SavedLink } from '@/context/saved-links-context';

// ─── Selectable card row ──────────────────────────────────────────────────────

interface SelectableCardProps {
  link: SavedLink;
  selected: boolean;
  onToggle: (id: number) => void;
}

function SelectableCard({ link, selected, onToggle }: SelectableCardProps) {
  return (
    <View style={styles.cardRow}>
      <CardLink
        verdict={link.verdict}
        title={link.title}
        originalUrl={link.originalUrl}
        finalUrl={link.finalUrl}
        bookmarked={link.isBookmarked}
        icon={false}
        onPress={() => onToggle(link.id)}
      />
      {/* 선택 시 카드 위에 어두운 오버레이 */}
      {selected && (
        <View style={styles.selectedOverlay} pointerEvents="none" />
      )}
      <View style={styles.checkOverlay} pointerEvents="none">
        <SelectionCircle selected={selected} />
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function FolderUrlSelectScreen() {
  const { folderName } = useLocalSearchParams<{ folderName: string }>();
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isCreating, setIsCreating] = useState(false);
  const { addFolder } = useFolders();
  const { links: allLinks, refreshLinks } = useSavedLinks();
  const links = allLinks.filter((l) => l.categoryId === null);
  const name = (folderName ?? '새 폴더').trim();

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
    if (isCreating) return;
    setIsCreating(true);
    try {
      await addFolder(name, [...selectedIds]);
      await refreshLinks();
      router.dismissAll();
      router.replace({
        pathname: '/(tabs)/(folder)',
        params: { folderCreated: String(Date.now()) },
      });
    } catch (error) {
      Alert.alert(
        '폴더 생성 실패',
        getFolderErrorMessage(error, '폴더를 생성하지 못했습니다. 잠시 후 다시 시도해주세요.'),
      );
    } finally {
      setIsCreating(false);
    }
  };

  const selectedCount = selectedIds.size;

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: '새 폴더 만들기',
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
              <SelectableCard
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

  // Selectable card
  cardRow: {
    position: 'relative',
    borderRadius: 22,
    overflow: 'hidden',
  },
  selectedOverlay: {
    position: 'absolute',
    inset: 0,
    borderRadius: 22,
    backgroundColor: Colors.brand.overlaySelected,
  },
  checkOverlay: {
    position: 'absolute',
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
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
