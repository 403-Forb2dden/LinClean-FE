import { useRef } from 'react';
import { Modal, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Colors, Typography } from '@/constants/theme';
import { useGuardedPress } from '@/utils/press-guard';
import type { AnchorPosition } from './folder-card';

const MENU_WIDTH = 140;
const MENU_ITEM_HEIGHT = 48;
const GAP = 4;
const SCREEN_PADDING = 8;

function isValidAnchor(anchor?: AnchorPosition): anchor is AnchorPosition {
  return Boolean(
    anchor &&
      Number.isFinite(anchor.x) &&
      Number.isFinite(anchor.y) &&
      Number.isFinite(anchor.width) &&
      Number.isFinite(anchor.height),
  );
}

export interface ContextMenuItem {
  label: string;
  onPress: () => void;
  destructive?: boolean;
}

export interface FolderContextMenuProps {
  visible: boolean;
  anchor?: AnchorPosition;
  /** 범용 메뉴 아이템. 제공 시 onEditName/onDelete 대신 사용됨 */
  items?: ContextMenuItem[];
  onEditName?: () => void;
  onDelete?: () => void;
  onDismiss?: () => void;
}

export function FolderContextMenu({
  visible,
  anchor,
  items,
  onEditName,
  onDelete,
  onDismiss,
}: FolderContextMenuProps) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const resolvedItems: ContextMenuItem[] = items ?? [
    { label: '폴더명 수정', onPress: () => onEditName?.() },
    { label: '폴더 삭제', onPress: () => onDelete?.(), destructive: true },
  ];
  const guardedDismiss = useGuardedPress(onDismiss, { lockMs: 250 });
  const guardedItemPress = useGuardedPress((item: ContextMenuItem) => {
    onDismiss?.();
    item.onPress();
  });

  const menuHeight = MENU_ITEM_HEIGHT * resolvedItems.length + (resolvedItems.length - 1);
  const lastAnchorRef = useRef<AnchorPosition | undefined>(undefined);

  if (isValidAnchor(anchor)) {
    lastAnchorRef.current = anchor;
  }

  const resolvedAnchor = isValidAnchor(anchor) ? anchor : lastAnchorRef.current;
  const fallbackLeft = Math.max(SCREEN_PADDING, screenWidth - MENU_WIDTH - SCREEN_PADDING);

  const menuTop = resolvedAnchor
    ? resolvedAnchor.y + resolvedAnchor.height + GAP + menuHeight > screenHeight
      ? resolvedAnchor.y - menuHeight - GAP
      : resolvedAnchor.y + resolvedAnchor.height + GAP
    : SCREEN_PADDING + GAP;

  const menuLeft = resolvedAnchor
    ? Math.min(resolvedAnchor.x, screenWidth - MENU_WIDTH - SCREEN_PADDING)
    : fallbackLeft;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <Pressable style={styles.backdrop} onPress={guardedDismiss}>
        <View style={[styles.menu, { top: menuTop, left: menuLeft }]}>
          {resolvedItems.map((item, index) => (
            <View key={item.label}>
              {index > 0 && <View style={styles.divider} />}
              <Pressable
                style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
                onPress={() => guardedItemPress?.(item)}
                accessibilityRole="button"
                accessibilityLabel={item.label}
              >
                <Text style={[styles.menuItemText, item.destructive && styles.deleteText]}>
                  {item.label}
                </Text>
              </Pressable>
            </View>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
  },
  menu: {
    position: 'absolute',
    width: MENU_WIDTH,
    backgroundColor: Colors.brand.surface,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: Colors.brand.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  menuItem: {
    height: MENU_ITEM_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  menuItemPressed: {
    backgroundColor: Colors.brand.background,
  },
  menuItemText: {
    ...Typography.caption,
    color: Colors.brand.text,
  },
  deleteText: {
    color: Colors.brand.textWarning,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.brand.line,
    marginHorizontal: 12,
  },
});
