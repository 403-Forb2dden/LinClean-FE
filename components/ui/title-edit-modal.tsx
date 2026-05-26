import { useCallback, useEffect, useRef, useState } from 'react';
import {
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Typography } from '@/constants/theme';
import { getSavedLinkErrorMessage, type SavedLink } from '@/context/saved-links-context';
import { showAlert } from '@/utils/guarded-alert';
import { useGuardedPress } from '@/utils/press-guard';

const MODAL_BOTTOM_GAP = 16;
const KEYBOARD_TOP_GAP = 8;

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

interface TitleEditModalProps {
  editingLink: SavedLink | null;
  onConfirm: (id: number, title: string) => Promise<void>;
  onClose: () => void;
}

export function TitleEditModal({ editingLink, onConfirm, onClose }: TitleEditModalProps) {
  const insets = useSafeAreaInsets();
  const [titleValue, setTitleValue] = useState('');
  const [isUpdatingTitle, setIsUpdatingTitle] = useState(false);
  const [keyboardInset, setKeyboardInset] = useState(0);
  const titleInputRef = useRef<TextInput>(null);
  const titleFocusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTitleFocusTimer = useCallback(() => {
    if (titleFocusTimerRef.current) {
      clearTimeout(titleFocusTimerRef.current);
      titleFocusTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!editingLink) {
      setTitleValue('');
      setKeyboardInset(0);
      clearTitleFocusTimer();
      return;
    }

    setTitleValue(editingLink.title);
  }, [clearTitleFocusTimer, editingLink]);

  useEffect(() => clearTitleFocusTimer, [clearTitleFocusTimer]);

  useEffect(() => {
    if (!editingLink) {
      return;
    }

    const showSubscription = Keyboard.addListener(showKeyboardEvent, (event) => {
      syncKeyboardLayoutAnimation(event);
      setKeyboardInset(event.endCoordinates.height);
    });
    const hideSubscription = Keyboard.addListener(hideKeyboardEvent, (event) => {
      syncKeyboardLayoutAnimation(event);
      setKeyboardInset(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [editingLink]);

  const handleClose = useCallback(() => {
    if (isUpdatingTitle) {
      return;
    }

    clearTitleFocusTimer();
    onClose();
  }, [clearTitleFocusTimer, isUpdatingTitle, onClose]);

  const handleModalShow = useCallback(() => {
    clearTitleFocusTimer();

    titleFocusTimerRef.current = setTimeout(() => {
      titleInputRef.current?.focus();
      titleFocusTimerRef.current = null;
    }, 100);
  }, [clearTitleFocusTimer]);

  const handleConfirm = useCallback(async () => {
    const trimmedTitle = titleValue.trim();

    if (!editingLink || trimmedTitle.length === 0 || trimmedTitle.length > 500 || isUpdatingTitle) {
      return;
    }

    setIsUpdatingTitle(true);

    try {
      await onConfirm(editingLink.id, trimmedTitle);
      clearTitleFocusTimer();
      onClose();
    } catch (error) {
      showAlert(
        '제목 수정 실패',
        getSavedLinkErrorMessage(error, '제목을 수정하지 못했습니다. 잠시 후 다시 시도해주세요.'),
      );
    } finally {
      setIsUpdatingTitle(false);
    }
  }, [clearTitleFocusTimer, editingLink, isUpdatingTitle, onClose, onConfirm, titleValue]);

  const trimmedTitleValue = titleValue.trim();
  const titleSubmitDisabled =
    trimmedTitleValue.length === 0 ||
    trimmedTitleValue.length > 500 ||
    trimmedTitleValue === editingLink?.title.trim() ||
    isUpdatingTitle;
  const guardedClose = useGuardedPress(handleClose, { disabled: isUpdatingTitle, lockMs: 250 });
  const guardedConfirm = useGuardedPress(handleConfirm, { disabled: titleSubmitDisabled });
  const guardedClearTitle = useGuardedPress(() => setTitleValue(''), {
    disabled: isUpdatingTitle,
    lockMs: 250,
  });
  const restingBottomInset = Math.max(insets.bottom, MODAL_BOTTOM_GAP);
  const modalBottomInset = keyboardInset > 0
    ? keyboardInset + KEYBOARD_TOP_GAP
    : restingBottomInset;

  return (
    <Modal
      visible={editingLink !== null}
      transparent
      animationType="fade"
      onRequestClose={guardedClose}
      onShow={handleModalShow}
    >
      <View
        style={[
          styles.overlay,
          { paddingBottom: modalBottomInset },
        ]}
      >
        <Pressable style={styles.backdrop} onPress={guardedClose} />
        <View style={styles.sheet}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.sheetContent}
          >
            <Text style={styles.sheetTitle}>제목 수정</Text>
            <View style={styles.inputRow}>
              <TextInput
                ref={titleInputRef}
                style={styles.input}
                value={titleValue}
                onChangeText={setTitleValue}
                placeholder="URL 제목 입력"
                placeholderTextColor={Colors.brand.textHint}
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
                maxLength={500}
                editable={!isUpdatingTitle}
              />
              {titleValue.length > 0 && !isUpdatingTitle && (
                <TouchableOpacity
                  onPress={guardedClearTitle}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={styles.clearButton}
                >
                  <Text style={styles.clearButtonText}>−</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={guardedClose}
                disabled={isUpdatingTitle}
              >
                <Text style={styles.cancelText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmBtn, titleSubmitDisabled && styles.confirmBtnDisabled]}
                onPress={guardedConfirm}
                disabled={titleSubmitDisabled}
              >
                <Text style={[styles.confirmText, titleSubmitDisabled && styles.confirmTextDisabled]}>
                  {isUpdatingTitle ? '저장 중...' : '저장'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
