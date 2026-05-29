import { useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Typography } from '@/constants/theme';
import { useGuardedPress } from '@/utils/press-guard';

const EXPANDED_LABEL_THRESHOLD = 6;
const MAX_VISIBLE_LABEL_CHARS = 15;
const LABEL_MAX_WIDTH = Typography.caption.fontSize * MAX_VISIBLE_LABEL_CHARS;
const DROPDOWN_MIN_WIDTH = 120;
const DROPDOWN_HORIZONTAL_PADDING = 32;
const DROPDOWN_MAX_CONTENT_WIDTH = LABEL_MAX_WIDTH + DROPDOWN_HORIZONTAL_PADDING;
const DROPDOWN_MAX_HEIGHT_RATIO = 0.6;
const DROPDOWN_SCREEN_PADDING = 20;
const DROPDOWN_MIN_HEIGHT = 120;

// ─── Types ────────────────────────────────────────────────────────────────────

export type FilterChipVariant = 'active' | 'inactive';

export interface FilterChipItem {
  label: string;
  value: string;
}

interface FilterChipProps {
  variant?: FilterChipVariant;
  label?: string;
  icon?: boolean;
  disabled?: boolean;
  items?: FilterChipItem[];
  selectedValue?: string;
  onSelect?: (value: string) => void;
  onPress?: () => void;
}

// ─── Dropdown ─────────────────────────────────────────────────────────────────

interface DropdownProps {
  items: FilterChipItem[];
  selectedValue: string;
  onSelect: (value: string) => void;
  width: number;
  maxHeight: number;
  left: number;
  top: number;
  onDismiss: () => void;
}

function Dropdown({ items, selectedValue, onSelect, width, maxHeight, left, top, onDismiss }: DropdownProps) {
  const guardedOnSelect = useGuardedPress(onSelect, { lockMs: 250 });

  return (
    <Modal transparent visible animationType="none" onRequestClose={onDismiss}>
      <View style={dropdownStyles.modalRoot}>
        <Pressable style={dropdownStyles.backdrop} onPress={onDismiss} />
        <View style={[dropdownStyles.container, { width, maxHeight, left, top }]}>
          <ScrollView
            style={dropdownStyles.scroll}
            nestedScrollEnabled
            showsVerticalScrollIndicator={items.length > 6}
            keyboardShouldPersistTaps="handled"
          >
            {items.map((item, index) => {
              const isSelected = item.value === selectedValue;
              const isLast = index === items.length - 1;

              return (
                <View key={item.value}>
                  <Pressable
                    onPress={() => guardedOnSelect?.(item.value)}
                    style={({ pressed }) => [
                      dropdownStyles.item,
                      isSelected && dropdownStyles.itemSelected,
                      pressed && dropdownStyles.itemPressed,
                    ]}
                    accessibilityRole="menuitem"
                    accessibilityState={{ selected: isSelected }}
                  >
                    <Text
                      style={[
                        dropdownStyles.itemLabel,
                        { color: isSelected ? Colors.brand.text : Colors.brand.textSecondary },
                      ]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                  {!isLast && <View style={dropdownStyles.divider} />}
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const dropdownStyles = StyleSheet.create({
  modalRoot: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    position: 'absolute',
    backgroundColor: Colors.brand.surface,
    borderRadius: 10,
    minWidth: DROPDOWN_MIN_WIDTH,
    zIndex: 100,
    shadowColor: Colors.brand.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  scroll: {
    flexGrow: 0,
  },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  itemSelected: {
    backgroundColor: Colors.brand.softMint,
  },
  itemPressed: {
    opacity: 0.7,
  },
  itemLabel: {
    ...Typography.caption,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.brand.line,
    marginHorizontal: 8,
  },
});

// ─── FilterChip ───────────────────────────────────────────────────────────────

export function FilterChip({
  variant = 'inactive',
  label,
  icon = true,
  disabled = false,
  items = [],
  selectedValue,
  onSelect,
  onPress,
}: FilterChipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [chipBounds, setChipBounds] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const chipRef = useRef<View>(null);
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const currentItem = items.find((i) => i.value === selectedValue);
  const displayLabel = label ?? currentItem?.label ?? '';
  const hasLongDropdownItem = items.some((item) => item.label.length > EXPANDED_LABEL_THRESHOLD);
  const dropdownWidth = Math.min(
    hasLongDropdownItem ? DROPDOWN_MAX_CONTENT_WIDTH : DROPDOWN_MIN_WIDTH,
    Math.max(DROPDOWN_MIN_WIDTH, width - 40),
  );
  const dropdownLeft = Math.max(
    DROPDOWN_SCREEN_PADDING,
    Math.min(chipBounds.x, width - dropdownWidth - DROPDOWN_SCREEN_PADDING),
  );
  const dropdownTop = chipBounds.y + chipBounds.height + insets.top + 4;
  const dropdownMaxHeight = Math.max(
    DROPDOWN_MIN_HEIGHT,
    Math.min(height * DROPDOWN_MAX_HEIGHT_RATIO, height - dropdownTop - DROPDOWN_SCREEN_PADDING),
  );

  const isActive = variant === 'active';
  const labelColor = disabled
    ? Colors.brand.textHint
    : Colors.brand.text;

  function handlePress() {
    if (disabled) return;
    if (isActive && items.length > 0) {
      if (isOpen) {
        setIsOpen(false);
      } else {
        chipRef.current?.measureInWindow((x, y, measuredWidth, measuredHeight) => {
          setChipBounds({ x, y, width: measuredWidth, height: measuredHeight });
          setIsOpen(true);
        });
      }
    }
    onPress?.();
  }

  function handleSelect(value: string) {
    setIsOpen(false);
    onSelect?.(value);
  }

  const guardedHandlePress = useGuardedPress(handlePress, { disabled, lockMs: 250 });

  return (
    <View style={chipStyles.wrapper}>
      <Pressable
        ref={chipRef}
        onPress={guardedHandlePress}
        style={({ pressed }) => [
          chipStyles.chip,
          disabled && chipStyles.chipDisabled,
          pressed && !disabled && chipStyles.chipPressed,
        ]}
        accessibilityRole="button"
        accessibilityState={{ disabled, expanded: isOpen }}
      >
        <Text
          style={[chipStyles.label, { color: labelColor }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {displayLabel}
        </Text>
        {icon && (
          <View style={isOpen ? chipStyles.iconRotated : undefined}>
            <IconSymbol
              name="chevron.down"
              size={16}
              color={disabled ? Colors.brand.textHint : Colors.brand.text}
            />
          </View>
        )}
      </Pressable>

      {isActive && isOpen && items.length > 0 && (
        <Dropdown
          items={items}
          selectedValue={selectedValue ?? ''}
          onSelect={handleSelect}
          width={dropdownWidth}
          maxHeight={dropdownMaxHeight}
          left={dropdownLeft}
          top={dropdownTop}
          onDismiss={() => setIsOpen(false)}
        />
      )}
    </View>
  );
}

const chipStyles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    alignSelf: 'flex-start',
    flexShrink: 1,
    minWidth: 0,
    maxWidth: '100%',
    zIndex: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    gap: 4,
    maxWidth: '100%',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: Colors.brand.line,
    backgroundColor: Colors.brand.surface,
  },
  chipDisabled: {
    backgroundColor: Colors.brand.background,
    borderColor: Colors.brand.line,
  },
  chipPressed: {
    opacity: 0.7,
  },
  label: {
    ...Typography.caption,
    flexShrink: 1,
    minWidth: 0,
  },
  iconRotated: {
    transform: [{ rotate: '180deg' }],
  },
});
