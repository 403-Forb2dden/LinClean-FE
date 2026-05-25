import { useCallback, useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Colors, Typography } from '@/constants/theme';
import { getSavedLinkErrorMessage, type SavedLink } from '@/context/saved-links-context';
import { showAlert } from '@/utils/guarded-alert';
import { useGuardedPress } from '@/utils/press-guard';

interface TitleEditModalProps {
  editingLink: SavedLink | null;
  onConfirm: (id: number, title: string) => Promise<void>;
  onClose: () => void;
}

export function TitleEditModal({ editingLink, onConfirm, onClose }: TitleEditModalProps) {
  const [titleValue, setTitleValue] = useState('');
  const [isUpdatingTitle, setIsUpdatingTitle] = useState(false);
  const titleInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!editingLink) {
      setTitleValue('');
      return;
    }

    setTitleValue(editingLink.title);
    const focusTimer = setTimeout(() => titleInputRef.current?.focus(), 100);

    return () => clearTimeout(focusTimer);
  }, [editingLink]);

  const handleClose = useCallback(() => {
    if (isUpdatingTitle) {
      return;
    }

    onClose();
  }, [isUpdatingTitle, onClose]);

  const handleConfirm = useCallback(async () => {
    const trimmedTitle = titleValue.trim();

    if (!editingLink || trimmedTitle.length === 0 || trimmedTitle.length > 500 || isUpdatingTitle) {
      return;
    }

    setIsUpdatingTitle(true);

    try {
      await onConfirm(editingLink.id, trimmedTitle);
      onClose();
    } catch (error) {
      showAlert(
        '제목 수정 실패',
        getSavedLinkErrorMessage(error, '제목을 수정하지 못했습니다. 잠시 후 다시 시도해주세요.'),
      );
    } finally {
      setIsUpdatingTitle(false);
    }
  }, [editingLink, isUpdatingTitle, onClose, onConfirm, titleValue]);

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

  return (
    <Modal
      visible={editingLink !== null}
      transparent
      animationType="fade"
      onRequestClose={guardedClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.backdrop} onPress={guardedClose} />
        <View style={styles.sheet}>
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
              onSubmitEditing={guardedConfirm}
              maxLength={500}
              editable={!isUpdatingTitle}
              autoFocus
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
        </View>
      </KeyboardAvoidingView>
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
