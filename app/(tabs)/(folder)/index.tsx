import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
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
  useWindowDimensions,
  View,
  type KeyboardEvent,
} from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AddFolderButton } from '@/components/ui/add-folder-button';
import { FolderCard } from '@/components/ui/folder-card';
import { FolderContextMenu } from '@/components/ui/folder-context-menu';
import { Toast } from '@/components/ui/toast';
import { Colors, ComponentTokens, Typography } from '@/constants/theme';
import type { AnchorPosition } from '@/components/ui/folder-card';
import { useSavedLinks } from '@/context/saved-links-context';
import { getFolderErrorMessage, useFolders } from '@/context/folders-context';
import { showAlert } from '@/utils/guarded-alert';
import { useGuardedPress } from '@/utils/press-guard';

type MenuState = {
  visible: boolean;
  anchor?: AnchorPosition;
  folderId?: number;
};

const FOLDER_SCREEN = ComponentTokens.folderScreen;
const FOLDER_CARD = ComponentTokens.folderCard;
const CONTENT_HORIZONTAL_PADDING = FOLDER_SCREEN.contentHorizontalPadding;
const CANVAS_PADDING_VERTICAL = FOLDER_SCREEN.canvasPaddingVertical;
const FOLDER_GRID_GAP = FOLDER_SCREEN.gridGap;
const DEFAULT_FOLDER_CARD_WIDTH = FOLDER_CARD.defaultWidth;
const MIN_TWO_COLUMN_CARD_WIDTH = FOLDER_SCREEN.minTwoColumnCardWidth;
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
  const { width: windowWidth } = useWindowDimensions();
  const tabBarHeight = useBottomTabBarHeight();
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
  const [gridWidth, setGridWidth] = useState(0);
  const lastCreatedToastRef = useRef<string | undefined>(undefined);
  const isMutatingRef = useRef(false);
  const renameInputRef = useRef<TextInput>(null);
  const renameFocusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const folderCreated = typeof folderCreatedParam === 'string' ? folderCreatedParam : undefined;
  const isCompactWidth = windowWidth < FOLDER_SCREEN.compactWidth;

  const folders = useMemo(
    () => rawFolders.map((folder) => ({ ...folder })),
    [rawFolders],
  );
  const folderCardWidth = useMemo(() => {
    const availableWidth = gridWidth;

    if (availableWidth <= 0) {
      return DEFAULT_FOLDER_CARD_WIDTH;
    }

    const twoColumnCardWidth = Math.floor((availableWidth - FOLDER_GRID_GAP) / 2);

    if (twoColumnCardWidth >= MIN_TWO_COLUMN_CARD_WIDTH) {
      return twoColumnCardWidth;
    }

    return availableWidth;
  }, [gridWidth]);

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
    if (renameState.folderId == null || !trimmed || trimmed === currentName || isMutatingRef.current) return;
    isMutatingRef.current = true;
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
      showAlert(
        '폴더명 수정 실패',
        getFolderErrorMessage(error, '폴더 이름을 수정하지 못했습니다. 잠시 후 다시 시도해주세요.'),
      );
    } finally {
      isMutatingRef.current = false;
      setIsMutating(false);
    }
  };

  const handleRenameCancel = () => {
    if (isMutatingRef.current) {
      return;
    }

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

    showAlert('폴더 삭제', '폴더를 삭제할까요? 폴더 안의 링크는 미분류 상태로 이동합니다.', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          if (isMutatingRef.current) return;
          isMutatingRef.current = true;
          setIsMutating(true);
          try {
            await deleteFolder(folderId);
            await refreshLinks();
            setDeleteToastVisible(true);
          } catch (error) {
            showAlert(
              '폴더 삭제 실패',
              getFolderErrorMessage(error, '폴더를 삭제하지 못했습니다. 잠시 후 다시 시도해주세요.'),
            );
          } finally {
            isMutatingRef.current = false;
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
  const guardedRenameCancel = useGuardedPress(handleRenameCancel, { disabled: isMutating, lockMs: 250 });
  const guardedRenameConfirm = useGuardedPress(handleRenameConfirm, { disabled: renameSubmitDisabled });
  const guardedClearRename = useGuardedPress(
    () => setRenameState((s) => ({ ...s, value: '' })),
    { disabled: isMutating, lockMs: 250 },
  );
  const renameRestingBottomInset = Math.max(insets.bottom, RENAME_MODAL_BOTTOM_GAP);
  const renameModalBottomInset = renameKeyboardInset > 0
    ? renameKeyboardInset + RENAME_KEYBOARD_TOP_GAP
    : renameRestingBottomInset;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: tabBarHeight + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* 상단 헤더 */}
        <View style={styles.header}>
          <Text style={[styles.title, isCompactWidth && styles.titleCompact]}>폴더</Text>
          <View style={styles.subtitleRow}>
            <Text style={styles.subtitle}>저장한 링크를 폴더별로 정리해요</Text>
            <AddFolderButton onPress={handleAddFolder} />
          </View>
        </View>

        {/* 폴더 캔버스 */}
        <View style={styles.canvas}>
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
            <View
              style={styles.grid}
              onLayout={(event) => setGridWidth(event.nativeEvent.layout.width)}
            >
              {folders.map((folder) => (
                <FolderCard
                  key={folder.id}
                  folderName={folder.name}
                  urlCount={folder.linkCount}
                  width={folderCardWidth}
                  variant="plain"
                  compactFolderName={isCompactWidth}
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
        onRequestClose={guardedRenameCancel}
        onShow={handleRenameModalShow}
      >
        <View
          style={[
            renameStyles.overlay,
            { paddingBottom: renameModalBottomInset },
          ]}
        >
          <Pressable style={renameStyles.backdrop} onPress={guardedRenameCancel} />
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
                    onPress={guardedClearRename}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={renameStyles.clearButton}
                  >
                    <Text style={renameStyles.clearButtonText}>−</Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={renameStyles.actions}>
                <TouchableOpacity style={renameStyles.cancelBtn} onPress={guardedRenameCancel}>
                  <Text style={renameStyles.cancelText}>취소</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[renameStyles.confirmBtn, renameSubmitDisabled && renameStyles.confirmBtnDisabled]}
                  onPress={guardedRenameConfirm}
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
    paddingHorizontal: CONTENT_HORIZONTAL_PADDING,
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
  titleCompact: {
    ...Typography.title,
  },
  subtitle: {
    flex: 1,
    flexShrink: 1,
    ...Typography.caption,
    color: Colors.brand.textSecondary,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: FOLDER_SCREEN.headerRowGap,
    marginTop: FOLDER_SCREEN.subtitleRowOffsetTop,
  },

  canvas: {
    paddingVertical: CANVAS_PADDING_VERTICAL,
    gap: FOLDER_SCREEN.canvasGap,
  },
  grid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: FOLDER_GRID_GAP,
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
