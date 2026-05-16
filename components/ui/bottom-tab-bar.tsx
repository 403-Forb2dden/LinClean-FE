import { TouchableOpacity, View, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography } from '@/constants/theme';
import { IconSymbol } from './icon-symbol';

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

export type TabVariant = 'home' | 'addLink' | 'folder';

export interface BottomTabItemProps {
  /** 탭 종류 */
  variant: TabVariant;
  /** 탭 라벨 텍스트 */
  label: string;
  /** 아이콘 표시 여부 */
  showIcon?: boolean;
  /** 비활성화 상태 */
  disabled?: boolean;
  /** 선택(활성) 상태 */
  active?: boolean;
  onPress?: () => void;
}

export interface BottomTabBarProps {
  activeTab: TabVariant;
  onTabPress?: (variant: TabVariant) => void;
  /** 각 탭의 label / showIcon / disabled 오버라이드 */
  home?: Partial<Pick<BottomTabItemProps, 'label' | 'showIcon' | 'disabled'>>;
  addLink?: Partial<Pick<BottomTabItemProps, 'label' | 'showIcon' | 'disabled'>>;
  folder?: Partial<Pick<BottomTabItemProps, 'label' | 'showIcon' | 'disabled'>>;
}

// ─────────────────────────────────────────
// Icon name per variant
// ─────────────────────────────────────────

const ICON_NAME: Record<TabVariant, 'house.fill' | 'link.badge.plus' | 'folder'> = {
  home: 'house.fill',
  addLink: 'link.badge.plus',
  folder: 'folder',
};

// ─────────────────────────────────────────
// BottomTabItem
// ─────────────────────────────────────────

export function BottomTabItem({
  variant,
  label,
  showIcon = true,
  disabled = false,
  active = false,
  onPress,
}: BottomTabItemProps) {
  const isAddLink = variant === 'addLink';

  const iconColor = disabled
    ? Colors.brand.textHint
    : active
      ? Colors.brand.text
      : Colors.brand.textHint;

  if (isAddLink) {
    return (
      <TouchableOpacity
        style={styles.tabItem}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
      >
        {showIcon && (
          <View style={[styles.addLinkCircle, disabled && styles.addLinkCircleDisabled]}>
            <IconSymbol name="link.badge.plus" size={24} color={Colors.brand.onPrimary} />
          </View>
        )}
        <Text
          style={[
            styles.label,
            active ? styles.labelActive : styles.labelDefault,
            disabled && styles.labelDisabled,
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.tabItem}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      {showIcon && (
        <IconSymbol name={ICON_NAME[variant]} size={24} color={iconColor} />
      )}
      <Text
        style={[
          styles.label,
          active ? styles.labelActive : styles.labelDefault,
          disabled && styles.labelDisabled,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────
// BottomTabBar
// ─────────────────────────────────────────

export function BottomTabBar({
  activeTab,
  onTabPress,
  home,
  addLink,
  folder,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={styles.border} />
      <View style={styles.row}>
        <BottomTabItem
          variant="home"
          label={home?.label ?? '홈'}
          showIcon={home?.showIcon ?? true}
          disabled={home?.disabled ?? false}
          active={activeTab === 'home'}
          onPress={() => onTabPress?.('home')}
        />
        <BottomTabItem
          variant="addLink"
          label={addLink?.label ?? '링크 추가'}
          showIcon={addLink?.showIcon ?? true}
          disabled={addLink?.disabled ?? false}
          active={activeTab === 'addLink'}
          onPress={() => onTabPress?.('addLink')}
        />
        <BottomTabItem
          variant="folder"
          label={folder?.label ?? '폴더'}
          showIcon={folder?.showIcon ?? true}
          disabled={folder?.disabled ?? false}
          active={activeTab === 'folder'}
          onPress={() => onTabPress?.('folder')}
        />
      </View>
    </View>
  );
}

// ─────────────────────────────────────────
// Styles
// ─────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.brand.surface,
  },
  border: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.brand.line,
  },
  row: {
    flexDirection: 'row',
    height: 64,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  addLinkCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -18,
  },
  addLinkCircleDisabled: {
    backgroundColor: Colors.brand.textHint,
  },
  label: {
    ...Typography.bold12,
    textAlign: 'center',
  },
  labelActive: {
    color: Colors.brand.text,
  },
  labelDefault: {
    color: Colors.brand.textHint,
    fontWeight: '400',
  },
  labelDisabled: {
    color: Colors.brand.textHint,
  },
});
