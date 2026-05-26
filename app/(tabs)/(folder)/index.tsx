import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  LayoutAnimation,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type KeyboardEvent,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AddFolderButton } from '@/components/ui/add-folder-button';
import { FolderCard } from '@/components/ui/folder-card';
import { FolderContextMenu } from '@/components/ui/folder-context-menu';
import { SectionHeader } from '@/components/ui/section-header';
import { Toast } from '@/components/ui/toast';
import { Colors, Typography } from '@/constants/theme';
import type { AnchorPosition } from '@/components/ui/folder-card';
import { useSavedLinks } from '@/context/saved-links-context';
import { getFolderErrorMessage, useFolders } from '@/context/folders-context';

type MenuState = {
  visible: boolean;
  anchor?: AnchorPosition;
  folderId?: number;
};

const RENAME_MODAL_BOTTOM_GAP = 16;
const RENAME_KEYBOARD_TOP_GAP = 8;

const showKeyboardEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
const hideKeyboardEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

const syncKeyboardLayoutAnimation = (event: KeyboardEvent) => {
  if (Platform.OS !== 'ios') {
    return;
  }

  const duration = event.duration > 10 ? event.duration : 10;

  LayoutAnimation.configureNext({
    duration,
    update: {
      duration,
      type: LayoutAnimation.Types[event.easing] || LayoutAnimation.Types.keyboard,
    },
  });
};

export default function FolderScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { folderCreated: folderCreatedParam } = useLocalSearchParams<{
    folderCreated?: string | string[];
  }>();
  const { refreshLinks } = useSavedLinks();
  const {
    folders: rawFolders,
    isLoading,
    errorMessage,
    renameFolder,
    deleteFolder,
  } = useFolders();
  const [menuState, setMenuState] = useState<MenuState>({ visible: false });
  const [renameState, setRenameState] = useState<{
    visible: boolean;
    folderId?: number;
    value: string;
    currentName: string;
  }>({
    visible: false,
    value: '',
    currentName: '',
  });
  const [isMutating, setIsMutating] = useState(false);
  const [renameKeyboardInset, setRenameKeyboardInset] = useState(0);
  const [createToastVisible, setCreateToastVisible] = useState(false);
  const [deleteToastVisible, setDeleteToastVisible] = useState(false);
  const [renameToastVisible, setRenameToastVisible] = useState(false);
  const lastCreatedToastRef = useRef<string | undefined>(undefined);
  const renameInputRef = useRef<TextInput>(null);
  const renameFocusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const folderCreated = typeof folderCreatedParam === 'string' ? folderCreatedParam : undefined;

  const folders = useMemo(
    () => rawFolders.map((folder) => ({ ...folder })),
    [rawFolders],
  );

  const handleMorePress = (folderId: number, anchor: AnchorPosition) => {
    setMenuState({ visible: true, anchor, folderId });
  };

  useEffect(() => {
    if (!folderCreated || lastCreatedToastRef.current === folderCreated) {
      return;
    }

    lastCreatedToastRef.current = folderCreated;
    setCreateToastVisible(true);
  }, [folderCreated]);

  useEffect(() => {
    return () => {
      if (renameFocusTimerRef.current) {
        clearTimeout(renameFocusTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!renameState.visible) {
      setRenameKeyboardInset(0);
      return;
    }

    const showSubscription = Keyboard.addListener(showKeyboardEvent, (event) => {
      syncKeyboardLayoutAnimation(event);
      setRenameKeyboardInset(event.endCoordinates.height);
    });
    const hideSubscription = Keyboard.addListener(hideKeyboardEvent, (event) => {
      syncKeyboardLayoutAnimation(event);
      setRenameKeyboardInset(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [renameState.visible]);

  const handleEditName = () => {
    if (menuState.folderId == null) return;
    const current = folders.find((f) => f.id === menuState.folderId)?.name ?? '';
    setRenameState({ visible: true, folderId: menuState.folderId, value: current, currentName: current });
  };

  const handleRenameConfirm = async () => {
    const trimmed = renameState.value.trim();
    const currentName = renameState.currentName.trim();
    if (renameState.folderId == null || !trimmed || trimmed === currentName || isMutating) return;
    setIsMutating(true);
    try {
      await renameFolder(renameState.folderId, trimmed);
      if (renameFocusTimerRef.current) {
        clearTimeout(renameFocusTimerRef.current);
        renameFocusTimerRef.current = null;
      }
      setRenameState({ visible: false, value: '', currentName: '' });
      setRenameToastVisible(true);
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
    if (renameFocusTimerRef.current) {
      clearTimeout(renameFocusTimerRef.current);
      renameFocusTimerRef.current = null;
    }
    setRenameState({ visible: false, value: '', currentName: '' });
  };

  const handleRenameModalShow = () => {
    if (renameFocusTimerRef.current) {
      clearTimeout(renameFocusTimerRef.current);
    }

    renameFocusTimerRef.current = setTimeout(() => {
      renameInputRef.current?.focus();
      renameFocusTimerRef.current = null;
    }, 100);
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
            setDeleteToastVisible(true);
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

  const trimmedRenameValue = renameState.value.trim();
  const renameSubmitDisabled =
    trimmedRenameValue.length === 0 ||
    trimmedRenameValue === renameState.currentName.trim() ||
    isMutating;
  const renameRestingBottomInset = Math.max(insets.bottom, RENAME_MODAL_BOTTOM_GAP);
  const renameModalBottomInset = renameKeyboardInset > 0
    ? renameKeyboardInset + RENAME_KEYBOARD_TOP_GAP
    : renameRestingBottomInset;

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

      <Toast
        visible={deleteToastVisible}
        message="폴더가 삭제되었어요"
        placement="top"
        topOffset={96}
        onHide={() => setDeleteToastVisible(false)}
      />
      <Toast
        visible={createToastVisible}
        message="폴더가 생성되었어요"
        placement="top"
        topOffset={96}
        onHide={() => setCreateToastVisible(false)}
      />
      <Toast
        visible={renameToastVisible}
        message="폴더명이 수정되었어요"
        placement="top"
        topOffset={96}
        onHide={() => setRenameToastVisible(false)}
      />

      {/* 폴더명 수정 모달 */}
      <Modal
        visible={renameState.visible}
        transparent
        animationType="fade"
        onRequestClose={handleRenameCancel}
        onShow={handleRenameModalShow}
      >
        <View
          style={[
            renameStyles.overlay,
            { paddingBottom: renameModalBottomInset },
          ]}
        >
          <Pressable style={renameStyles.backdrop} onPress={handleRenameCancel} />
          <View style={renameStyles.sheet}>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={renameStyles.sheetContent}
            >
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
                  onSubmitEditing={Keyboard.dismiss}
                  maxLength={50}
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
                <TouchableOpacity
                  style={renameStyles.cancelBtn}
                  onPress={handleRenameCancel}
                >
                  <Text style={renameStyles.cancelText}>취소</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[renameStyles.confirmBtn, renameSubmitDisabled && renameStyles.confirmBtnDisabled]}
                  onPress={handleRenameConfirm}
                  disabled={renameSubmitDisabled}
                >
                  <Text style={[renameStyles.confirmText, renameSubmitDisabled && renameStyles.confirmTextDisabled]}>
                    저장
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
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
    width: '100%',
    maxHeight: '80%',
    backgroundColor: Colors.brand.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  sheetContent: {
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
