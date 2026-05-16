import { Dimensions, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors, Typography } from '@/constants/theme';
import type { AnchorPosition } from './folder-card';

const MENU_WIDTH = 140;
const MENU_ITEM_HEIGHT = 48;
const GAP = 4;

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
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  const resolvedItems: ContextMenuItem[] = items ?? [
    { label: '폴더명 수정', onPress: () => onEditName?.() },
    { label: '폴더 삭제', onPress: () => onDelete?.(), destructive: true },
  ];

  const menuHeight = MENU_ITEM_HEIGHT * resolvedItems.length + (resolvedItems.length - 1);

  const menuTop = anchor
    ? anchor.y + anchor.height + GAP + menuHeight > screenHeight
      ? anchor.y - menuHeight - GAP
      : anchor.y + anchor.height + GAP
    : screenHeight / 2;

  const menuLeft = anchor
    ? Math.min(anchor.x, screenWidth - MENU_WIDTH - 8)
    : (screenWidth - MENU_WIDTH) / 2;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <Pressable style={styles.backdrop} onPress={onDismiss}>
        <View style={[styles.menu, { top: menuTop, left: menuLeft }]}>
          {resolvedItems.map((item, index) => (
            <View key={item.label}>
              {index > 0 && <View style={styles.divider} />}
              <Pressable
                style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
                onPress={() => {
                  onDismiss?.();
                  item.onPress();
                }}
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
