import { useCallback, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { AppIcon } from '@/components/ui/app-icon';
import { CardLink } from '@/components/ui/card-link';
import { FolderContextMenu } from '@/components/ui/folder-context-menu';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SectionHeader } from '@/components/ui/section-header';
import { Colors, Typography } from '@/constants/theme';
import { getSavedLinkErrorMessage, useSavedLinks, type SavedLink } from '@/context/saved-links-context';
import type { AnchorPosition } from '@/components/ui/folder-card';

export default function HomeScreen() {
  const { links, toggleBookmark, deleteLink, updateTitle } = useSavedLinks();
  const [menuState, setMenuState] = useState<{ visible: boolean; anchor?: AnchorPosition; linkId?: number }>({ visible: false });
  const [editingLink, setEditingLink] = useState<SavedLink | null>(null);
  const [titleValue, setTitleValue] = useState('');
  const [isUpdatingTitle, setIsUpdatingTitle] = useState(false);
  const titleInputRef = useRef<TextInput>(null);

  // 최근 저장한 링크 — createdAt 내림차순 상위 3개
  const recentLinks = links.slice(0, 3);

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

  const openTitleModal = useCallback((link: SavedLink) => {
    setEditingLink(link);
    setTitleValue(link.title);
    setTimeout(() => titleInputRef.current?.focus(), 100);
  }, []);

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
              size={30}
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
    ...Typography.displayMedium,
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
    backgroundColor: Colors.brand.surface,
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
