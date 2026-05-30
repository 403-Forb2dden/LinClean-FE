import { useRef } from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Colors, Typography } from '@/constants/theme';
import { useGuardedPress } from '@/utils/press-guard';
import { IconSymbol } from './icon-symbol';

type FolderCardVariant = 'tabbed' | 'plain';

const DEFAULT_CARD_WIDTH = 144;
const CARD_HEIGHT = 128;
const CARD_BODY_TOP = 16;
const CARD_BODY_MIN_HEIGHT = 112;
const CARD_TAB_WIDTH = 72;
const CARD_TAB_HEIGHT = 30;
const CARD_TAB_LEFT = 10;
const CARD_HORIZONTAL_PADDING = 14;
const CARD_VERTICAL_PADDING = 18;
const CARD_MENU_SIZE = 22;
const CARD_RADIUS = 12;
const TAB_RADIUS = 8;
const TOUCH_HIT_SLOP = 8;

export interface AnchorPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FolderCardProps {
  folderName: string;
  urlCount: number;
  width?: number;
  onPress?: () => void;
  onMorePress?: (anchor: AnchorPosition) => void;
  disabled?: boolean;
  icon?: boolean;
  variant?: FolderCardVariant;
}

export function FolderCard({
  folderName,
  urlCount,
  width,
  onPress,
  onMorePress,
  disabled = false,
  icon = true,
  variant = 'tabbed',
}: FolderCardProps) {
  const moreRef = useRef<View>(null);
  const cardWidth = width ?? DEFAULT_CARD_WIDTH;
  const guardedOnPress = useGuardedPress(onPress, { disabled });
  const guardedOnMorePress = useGuardedPress(onMorePress, { disabled });
  const isTabbed = variant === 'tabbed';

  const handleMorePress = () => {
    moreRef.current?.measure((_fx, _fy, measuredWidth, measuredHeight, px, py) => {
      guardedOnMorePress?.({ x: px, y: py, width: measuredWidth, height: measuredHeight });
    });
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.root,
        { width: cardWidth },
        isTabbed ? styles.rootTabbed : styles.rootPlain,
        pressed && !disabled && styles.pressed,
      ]}
      onPress={guardedOnPress}
      accessibilityRole="button"
      accessibilityLabel={`${folderName} 폴더, ${urlCount}개`}
      accessibilityState={{ disabled }}
    >
      {isTabbed ? (
        <View style={[styles.tab, disabled && styles.tabDisabled]} />
      ) : null}
      <View
        style={[
          styles.body,
          { width: cardWidth },
          disabled && styles.bodyDisabled,
          !isTabbed && styles.bodyPlain,
        ]}
      >
        <View style={styles.header}>
          <Text style={[styles.count, disabled && styles.countDisabled]}>{urlCount}개</Text>
          {icon ? (
            <View ref={moreRef} collapsable={false}>
              <TouchableOpacity
                onPress={handleMorePress}
                disabled={disabled}
                hitSlop={{ top: TOUCH_HIT_SLOP, bottom: TOUCH_HIT_SLOP, left: TOUCH_HIT_SLOP, right: TOUCH_HIT_SLOP }}
                activeOpacity={0.7}
                style={styles.moreButton}
              >
                <IconSymbol
                  name="ellipsis"
                  size={CARD_MENU_SIZE}
                  color={disabled ? Colors.brand.textHint : Colors.brand.textHint}
                />
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
        <Text style={[styles.folderName, disabled && styles.folderNameDisabled]} numberOfLines={2}>
          {folderName}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flexShrink: 0,
  },
  rootTabbed: {
    height: CARD_HEIGHT,
    paddingTop: CARD_BODY_TOP,
  },
  rootPlain: {
    minHeight: CARD_BODY_MIN_HEIGHT,
  },
  tab: {
    position: 'absolute',
    top: 0,
    left: CARD_TAB_LEFT,
    width: CARD_TAB_WIDTH,
    height: CARD_TAB_HEIGHT,
    borderTopLeftRadius: TAB_RADIUS,
    borderTopRightRadius: TAB_RADIUS,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: Colors.brand.line,
    backgroundColor: Colors.brand.softMint,
  },
  tabDisabled: {
    backgroundColor: Colors.brand.softMint,
    borderColor: Colors.brand.line,
  },
  body: {
    flex: 1,
    minHeight: CARD_BODY_MIN_HEIGHT,
    justifyContent: 'space-between',
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    borderColor: Colors.brand.line,
    backgroundColor: Colors.brand.surface,
    paddingHorizontal: CARD_HORIZONTAL_PADDING,
    paddingVertical: CARD_VERTICAL_PADDING,
    overflow: 'hidden',
  },
  bodyPlain: {
    flex: 0,
  },
  bodyDisabled: {
    borderColor: Colors.brand.line,
    backgroundColor: Colors.brand.surface,
  },
  pressed: {
    opacity: 0.82,
  },
  header: {
    minHeight: CARD_MENU_SIZE,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  count: {
    ...Typography.body,
    color: Colors.brand.textSecondary,
  },
  countDisabled: {
    color: Colors.brand.textHint,
  },
  moreButton: {
    width: CARD_MENU_SIZE,
    height: CARD_MENU_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  folderName: {
    ...Typography.title,
    color: Colors.brand.text,
  },
  folderNameDisabled: {
    color: Colors.brand.textHint,
  },
});
