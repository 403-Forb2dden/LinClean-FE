import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Typography } from '@/constants/theme';
import { useGuardedPress } from '@/utils/press-guard';

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
}

function Dropdown({ items, selectedValue, onSelect }: DropdownProps) {
  const guardedOnSelect = useGuardedPress(onSelect, { lockMs: 250 });

  return (
    <View style={dropdownStyles.container}>
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
    minWidth: 120,
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

  const currentItem = items.find((i) => i.value === selectedValue);
  const displayLabel = label ?? currentItem?.label ?? '';

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

  const guardedHandlePress = useGuardedPress(handlePress, { disabled, lockMs: 250 });

  return (
    <View style={chipStyles.wrapper}>
      <Pressable
        onPress={guardedHandlePress}
        style={({ pressed }) => [
          chipStyles.chip,
          disabled && chipStyles.chipDisabled,
          pressed && !disabled && chipStyles.chipPressed,
        ]}
        accessibilityRole="button"
        accessibilityState={{ disabled, expanded: isOpen }}
      >
        <Text style={[chipStyles.label, { color: labelColor }]}>{displayLabel}</Text>
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
        />
      )}
    </View>
  );
}

const chipStyles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    alignSelf: 'flex-start',
    zIndex: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
  },
  iconRotated: {
    transform: [{ rotate: '180deg' }],
  },
});
