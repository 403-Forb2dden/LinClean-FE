import { useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
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
import { useRouter } from 'expo-router';
import { AddFolderButton } from '@/components/ui/add-folder-button';
import { FolderCard } from '@/components/ui/folder-card';
import { FolderContextMenu } from '@/components/ui/folder-context-menu';
import { SectionHeader } from '@/components/ui/section-header';
import { Colors, Typography } from '@/constants/theme';
import type { AnchorPosition } from '@/components/ui/folder-card';
import { useSavedLinks } from '@/context/saved-links-context';
import { getFolderErrorMessage, useFolders } from '@/context/folders-context';

type MenuState = {
  visible: boolean;
  anchor?: AnchorPosition;
  folderId?: number;
};

export default function FolderScreen() {
  const router = useRouter();
  const { refreshLinks } = useSavedLinks();
  const {
    folders: rawFolders,
    isLoading,
    errorMessage,
    renameFolder,
    deleteFolder,
  } = useFolders();
  const [menuState, setMenuState] = useState<MenuState>({ visible: false });
  const [renameState, setRenameState] = useState<{ visible: boolean; folderId?: number; value: string }>({
    visible: false,
    value: '',
  });
  const [isMutating, setIsMutating] = useState(false);
  const renameInputRef = useRef<TextInput>(null);

  const folders = useMemo(
    () => rawFolders.map((folder) => ({ ...folder })),
    [rawFolders],
  );

  const handleMorePress = (folderId: number, anchor: AnchorPosition) => {
    setMenuState({ visible: true, anchor, folderId });
  };

  const handleEditName = () => {
    if (menuState.folderId == null) return;
    const current = folders.find((f) => f.id === menuState.folderId)?.name ?? '';
    setRenameState({ visible: true, folderId: menuState.folderId, value: current });
    setTimeout(() => renameInputRef.current?.focus(), 100);
  };

  const handleRenameConfirm = async () => {
    const trimmed = renameState.value.trim();
    if (renameState.folderId == null || !trimmed || isMutating) return;
    setIsMutating(true);
    try {
      await renameFolder(renameState.folderId, trimmed);
      setRenameState({ visible: false, value: '' });
    } catch (error) {
      Alert.alert(
        '폴더명 수정 실패',
        getFolderErrorMessage(error, '폴더 이름을 수정하지 못했습니다. 잠시 후 다시 시도해주세요.'),
      );
    } finally {
      setIsMutating(false);
    }
  };

  const handleRenameCancel = () => {
    setRenameState({ visible: false, value: '' });
  };

  const handleDelete = () => {
    if (menuState.folderId == null) return;
    const folderId = menuState.folderId;

    Alert.alert('폴더 삭제', '폴더를 삭제할까요? 폴더 안의 링크는 미분류 상태로 이동합니다.', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          if (isMutating) return;
          setIsMutating(true);
          try {
            await deleteFolder(folderId);
            await refreshLinks();
          } catch (error) {
            Alert.alert(
              '폴더 삭제 실패',
              getFolderErrorMessage(error, '폴더를 삭제하지 못했습니다. 잠시 후 다시 시도해주세요.'),
            );
          } finally {
            setIsMutating(false);
          }
        },
      },
    ]);
  };

  const handleAddFolder = () => {
    router.push('/folder-name');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* 상단 헤더 */}
        <View style={styles.header}>
          <Text style={styles.title}>폴더</Text>
          <Text style={styles.subtitle}>저장한 링크를 폴더별로 정리해요</Text>
        </View>

        {/* 폴더 캔버스 */}
        <View style={styles.canvas}>
          <SectionHeader
            label="내 폴더"
            rightSlot={<AddFolderButton onPress={handleAddFolder} />}
          />

          {errorMessage ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {isLoading ? (
            <View style={styles.loadingState}>
              <ActivityIndicator color={Colors.brand.primary} />
            </View>
          ) : folders.length > 0 ? (
            <View style={styles.grid}>
              {folders.map((folder) => (
                <FolderCard
                  key={folder.id}
                  folderName={folder.name}
                  urlCount={folder.linkCount}
                  onPress={() => router.push({ pathname: '/(tabs)/(folder)/[id]' as any, params: { id: folder.id } })}
                  onMorePress={(anchor) => handleMorePress(folder.id, anchor)}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>아직 폴더가 없어요</Text>
              <Text style={styles.emptySubtext}>
                폴더 추가 버튼을 눌러 정리를 시작해보세요
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <FolderContextMenu
        visible={menuState.visible}
        anchor={menuState.anchor}
        onEditName={handleEditName}
        onDelete={handleDelete}
        onDismiss={() => setMenuState({ visible: false })}
      />

      {/* 폴더명 수정 모달 */}
      <Modal
        visible={renameState.visible}
        transparent
        animationType="fade"
        onRequestClose={handleRenameCancel}
      >
        <KeyboardAvoidingView
          style={renameStyles.overlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Pressable style={renameStyles.backdrop} onPress={handleRenameCancel} />
          <View style={renameStyles.sheet}>
            <Text style={renameStyles.sheetTitle}>폴더명 수정</Text>
            <View style={renameStyles.inputRow}>
              <TextInput
                ref={renameInputRef}
                style={renameStyles.input}
                value={renameState.value}
                onChangeText={(v) => setRenameState((s) => ({ ...s, value: v }))}
                placeholder="폴더 이름 입력"
                placeholderTextColor={Colors.brand.textHint}
                returnKeyType="done"
                onSubmitEditing={handleRenameConfirm}
                maxLength={50}
                autoFocus
              />
              {renameState.value.length > 0 && (
                <TouchableOpacity
                  onPress={() => setRenameState((s) => ({ ...s, value: '' }))}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={renameStyles.clearButton}
                >
                  <Text style={renameStyles.clearButtonText}>−</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={renameStyles.actions}>
              <TouchableOpacity style={renameStyles.cancelBtn} onPress={handleRenameCancel}>
                <Text style={renameStyles.cancelText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[renameStyles.confirmBtn, !renameState.value.trim() && renameStyles.confirmBtnDisabled]}
                onPress={handleRenameConfirm}
                disabled={!renameState.value.trim() || isMutating}
              >
                <Text style={[renameStyles.confirmText, !renameState.value.trim() && renameStyles.confirmTextDisabled]}>
                  저장
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
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 20,
  },

  header: {
    paddingTop: 16,
    gap: 4,
  },
  title: {
    ...Typography.pageTitle,
    color: Colors.brand.text,
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.brand.textSecondary,
  },

  canvas: {
    backgroundColor: Colors.brand.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.brand.line,
    padding: 16,
    gap: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  errorBox: {
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
  loadingState: {
    paddingVertical: 40,
    alignItems: 'center',
  },

  emptyState: {
    paddingVertical: 40,
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
