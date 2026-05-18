import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { AddFolderButton } from '@/components/ui/add-folder-button';
import { AppIcon } from '@/components/ui/app-icon';
import { CardLink } from '@/components/ui/card-link';
import { FolderContextMenu } from '@/components/ui/folder-context-menu';
import { Toast } from '@/components/ui/toast';
import { Colors, Typography } from '@/constants/theme';
import { useSavedLinks } from '@/context/saved-links-context';
import { useFolders } from '@/context/folders-context';
import type { AnchorPosition } from '@/components/ui/folder-card';
import { useEffect, useState } from 'react';

type MoreMenuState = {
  visible: boolean;
  anchor?: AnchorPosition;
  linkId?: number;
};

export default function FolderDetailScreen() {
  const { id, urlAdded } = useLocalSearchParams<{ id: string; urlAdded?: string }>();
  const router = useRouter();
  const folderId = Number(id);

  const { links, toggleBookmark, assignCategory } = useSavedLinks();
  const { folders } = useFolders();
  const folderLinks = links.filter((l) => l.categoryId === folderId);
  const folderName = folders.find((f) => f.id === folderId)?.name ?? '폴더';

  const [menuState, setMenuState] = useState<MoreMenuState>({ visible: false });
  const [toastVisible, setToastVisible] = useState(false);
  const [addToastVisible, setAddToastVisible] = useState(false);

  useEffect(() => {
    if (urlAdded === '1') setAddToastVisible(true);
  }, [urlAdded]);

  const handleMore = (linkId: number, anchor: AnchorPosition) => {
    setMenuState({ visible: true, anchor, linkId });
  };

  const handleDelete = (linkId: number) => {
    // API: PATCH /api/v1/saved-links/{id} { categoryId: null }
    assignCategory([linkId], null);
    setToastVisible(true);
  };

  const handleAddUrl = () => {
    router.push({
      pathname: '/(tabs)/(folder)/folder-add-url',
      params: { folderId: String(folderId), folderName },
    });
  };

  const currentLink = folderLinks.find((l) => l.id === menuState.linkId);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* 헤더 */}
      <View style={styles.header}>
        <AppIcon name="back" size={24} onPress={() => router.back()} />
        <Text style={styles.headerTitle}>폴더 목록</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* 폴더명 + URL 추가 버튼 */}
        <View style={styles.canvasHeaderWrapper}>
          <View style={styles.canvasHeader}>
            <View style={styles.folderTitleGroup}>
              <Text style={styles.folderTitleLabel}>현재 폴더</Text>
              <Text style={styles.folderName} numberOfLines={1} ellipsizeMode="tail">
                {folderName}
              </Text>
            </View>
            <AddFolderButton label="URL 추가" onPress={handleAddUrl} />
          </View>
          <Toast
            visible={toastVisible}
            message="폴더에서 제외되었어요"
            onHide={() => setToastVisible(false)}
          />
          <Toast
            visible={addToastVisible}
            message="URL이 추가되었어요"
            onHide={() => setAddToastVisible(false)}
          />
        </View>

        {/* 링크 목록 */}
        {folderLinks.length > 0 ? (
          <View style={styles.list}>
            {folderLinks.map((link) => (
              <CardLink
                key={link.id}
                verdict={link.verdict}
                title={link.title}
                originalUrl={link.originalUrl}
                finalUrl={link.finalUrl}
                bookmarked={link.isBookmarked}
                onBookmark={() => toggleBookmark(link.id)}
                onMore={(anchor: AnchorPosition) => handleMore(link.id, anchor)}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>이 폴더에 링크가 없어요</Text>
            <Text style={styles.emptySubtext}>URL 추가 버튼을 눌러 링크를 저장해보세요</Text>
          </View>
        )}
      </ScrollView>

      <FolderContextMenu
        visible={menuState.visible}
        anchor={menuState.anchor}
        items={[
          {
            label: currentLink?.isBookmarked ? '북마크 해제' : '북마크 추가',
            onPress: () => {
              if (menuState.linkId == null) return;
              // API: PATCH /saved-links/{id}/bookmark
              toggleBookmark(menuState.linkId);
            },
          },
          {
            label: '폴더에서 삭제',
            destructive: true,
            onPress: () => {
              if (menuState.linkId == null) return;
              // API: PATCH /api/v1/saved-links/{id} { categoryId: null }
              handleDelete(menuState.linkId);
            },
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

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  headerTitle: {
    ...Typography.pageTitle,
    color: Colors.brand.text,
    flex: 1,
  },
  headerSpacer: {
    width: 24,
  },

  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 12,
  },

  canvasHeaderWrapper: {
    position: 'relative',
  },
  canvasHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 4,
  },
  folderTitleGroup: {
    flex: 1,
    minWidth: 0,
    gap: 4,
    marginLeft: 10,
  },
  folderTitleLabel: {
    ...Typography.caption,
    color: Colors.brand.textSecondary,
  },
  folderName: {
    ...Typography.title,
    color: Colors.brand.text,
  },

  list: {
    gap: 10,
  },

  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: 6,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.brand.textSecondary,
  },
  emptySubtext: {
    ...Typography.caption,
    color: Colors.brand.textHint,
  },
});
