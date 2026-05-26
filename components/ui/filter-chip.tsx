import { useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Typography } from '@/constants/theme';

const EXPANDED_LABEL_THRESHOLD = 6;
const MAX_VISIBLE_LABEL_CHARS = 15;
const LABEL_MAX_WIDTH = Typography.caption.fontSize * MAX_VISIBLE_LABEL_CHARS;
const DROPDOWN_MIN_WIDTH = 120;
const DROPDOWN_HORIZONTAL_PADDING = 32;
const DROPDOWN_MAX_CONTENT_WIDTH = LABEL_MAX_WIDTH + DROPDOWN_HORIZONTAL_PADDING;

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
}

function Dropdown({ items, selectedValue, onSelect, width }: DropdownProps) {
  return (
    <View style={[dropdownStyles.container, { width }]}>
      {items.map((item, index) => {
        const isSelected = item.value === selectedValue;
        const isLast = index === items.length - 1;

        return (
          <View key={item.value}>
            <Pressable
              onPress={() => onSelect(item.value)}
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
    </View>
  );
}

const dropdownStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '100%',
    left: 0,
    marginTop: 4,
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
  const { width } = useWindowDimensions();

  const currentItem = items.find((i) => i.value === selectedValue);
  const displayLabel = label ?? currentItem?.label ?? '';
  const hasLongDropdownItem = items.some((item) => item.label.length > EXPANDED_LABEL_THRESHOLD);
  const dropdownWidth = Math.min(
    hasLongDropdownItem ? DROPDOWN_MAX_CONTENT_WIDTH : DROPDOWN_MIN_WIDTH,
    Math.max(DROPDOWN_MIN_WIDTH, width - 40),
  );

  const isActive = variant === 'active';
  const labelColor = disabled
    ? Colors.brand.textHint
    : Colors.brand.text;

  function handlePress() {
    if (disabled) return;
    if (isActive && items.length > 0) {
      setIsOpen((prev) => !prev);
    }
    onPress?.();
  }

  function handleSelect(value: string) {
    setIsOpen(false);
    onSelect?.(value);
  }

  return (
    <View style={chipStyles.wrapper}>
      <Pressable
        onPress={handlePress}
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
