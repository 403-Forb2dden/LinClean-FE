import { useEffect, useState } from 'react';
import {
  Keyboard,
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
  const [title, setTitle] = useState(initialTitle);

  const trimmedTitle = title.trim();
  const saveDisabled = loading || trimmedTitle.length === 0;

  useEffect(() => {
    setTitle(initialTitle);
  }, [initialTitle, visible]);

  const handleSave = () => {
    if (saveDisabled) return;
    onSave(trimmedTitle);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.backdrop} onPress={loading ? undefined : onCancel} />

        <View style={styles.sheet}>
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
              onPress={onCancel}
              activeOpacity={0.8}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>취소</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveButton, saveDisabled && styles.saveButtonDisabled]}
              onPress={handleSave}
              activeOpacity={0.8}
              disabled={saveDisabled}
            >
              <Text style={[styles.saveButtonText, saveDisabled && styles.saveButtonTextDisabled]}>
                {loading ? '저장 중...' : '저장'}
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
    backgroundColor: 'rgba(29, 38, 35, 0.42)',
  },
  sheet: {
    width: '100%',
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 14,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  handle: {
    alignSelf: 'center',
    width: 51,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.brand.line,
    marginBottom: 30,
  },
  header: {
    gap: 14,
    marginBottom: 34,
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
    gap: 12,
    marginBottom: 28,
  },
  label: {
    ...Typography.caption,
    color: Colors.brand.text,
  },
  input: {
    height: 56,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.brand.line,
    paddingHorizontal: 18,
    ...Typography.body,
    color: Colors.brand.text,
    backgroundColor: Colors.light.background,
  },
  urlBox: {
    height: 56,
    borderRadius: 20,
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
    marginTop: 4,
  },
  cancelButton: {
    flex: 1,
    height: 56,
    borderRadius: 28,
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
    height: 56,
    borderRadius: 28,
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
