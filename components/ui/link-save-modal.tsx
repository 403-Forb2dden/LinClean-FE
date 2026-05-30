import { useEffect, useState } from 'react';
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
import { useGuardedPress } from '@/utils/press-guard';

const MODAL_BOTTOM_GAP = 16;
const KEYBOARD_TOP_GAP = 16;

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

interface LinkSaveModalProps {
  visible: boolean;
  url: string;
  // 향후 링크카드 more 버튼의 URL 제목 수정 기능에서 기존 제목을 초기값으로 사용합니다.
  initialTitle?: string;
  loading?: boolean;
  onCancel: () => void;
  onSave: (title: string) => void;
}

export function LinkSaveModal({
  visible,
  url,
  initialTitle = '',
  loading = false,
  onCancel,
  onSave,
}: LinkSaveModalProps) {
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState(initialTitle);
  const [keyboardInset, setKeyboardInset] = useState(0);

  const trimmedTitle = title.trim();
  const saveDisabled = loading || trimmedTitle.length === 0;

  useEffect(() => {
    setTitle(initialTitle);
  }, [initialTitle, visible]);

  useEffect(() => {
    if (!visible) {
      setKeyboardInset(0);
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
  }, [visible]);

  const handleSave = () => {
    if (saveDisabled) return;
    onSave(trimmedTitle);
  };
  const guardedCancel = useGuardedPress(onCancel, { disabled: loading, lockMs: 250 });
  const guardedSave = useGuardedPress(handleSave, { disabled: saveDisabled });
  const restingBottomInset = Math.max(insets.bottom, MODAL_BOTTOM_GAP);
  const modalBottomInset = keyboardInset > 0
    ? keyboardInset + KEYBOARD_TOP_GAP
    : restingBottomInset;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={guardedCancel}
    >
      <View style={[styles.overlay, { paddingBottom: modalBottomInset }]}>
        <Pressable style={styles.backdrop} onPress={guardedCancel} />

        <View style={styles.sheet}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.sheetContent}
          >
            <View style={styles.handle} />

            <View style={styles.header}>
              <Text style={styles.title}>링크 저장</Text>
              <Text style={styles.description}>저장할 URL 제목을 입력해 주세요.</Text>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>URL 제목</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="예: 네이버 블로그"
                placeholderTextColor={Colors.brand.textHint}
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
                maxLength={500}
                editable={!loading}
                autoFocus
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>검사 대상 URL</Text>
              <View style={styles.urlBox}>
                <Text style={styles.urlText} numberOfLines={1} ellipsizeMode="tail">
                  {url}
                </Text>
              </View>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={guardedCancel}
                activeOpacity={0.8}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveButton, saveDisabled && styles.saveButtonDisabled]}
                onPress={guardedSave}
                activeOpacity={0.8}
                disabled={saveDisabled}
              >
                <Text style={[styles.saveButtonText, saveDisabled && styles.saveButtonTextDisabled]}>
                  {loading ? '저장 중...' : '저장'}
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
    backgroundColor: 'rgba(29, 38, 35, 0.42)',
  },
  sheet: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  sheetContent: {
    paddingTop: 12,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  handle: {
    alignSelf: 'center',
    width: 51,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.brand.line,
    marginBottom: 22,
  },
  header: {
    gap: 8,
    marginBottom: 24,
  },
  title: {
    ...Typography.title,
    color: Colors.brand.text,
  },
  description: {
    ...Typography.summary,
    color: Colors.brand.textSecondary,
  },
  fieldGroup: {
    gap: 10,
    marginBottom: 20,
  },
  label: {
    ...Typography.caption,
    color: Colors.brand.text,
  },
  input: {
    height: 52,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.brand.line,
    paddingHorizontal: 18,
    ...Typography.body,
    color: Colors.brand.text,
    backgroundColor: Colors.light.background,
  },
  urlBox: {
    height: 52,
    borderRadius: 18,
    backgroundColor: Colors.brand.background,
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  urlText: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.brand.text,
  },
  actions: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 0,
  },
  cancelButton: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: Colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.background,
  },
  cancelButtonText: {
    ...Typography.section,
    color: Colors.brand.primary,
  },
  saveButton: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.brand.primary,
  },
  saveButtonDisabled: {
    backgroundColor: Colors.brand.softMint,
  },
  saveButtonText: {
    ...Typography.section,
    color: Colors.light.background,
  },
  saveButtonTextDisabled: {
    color: Colors.brand.textHint,
  },
});
