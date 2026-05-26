import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Colors } from '@/constants/theme';

interface SelectionCircleProps {
  selected: boolean;
  style?: StyleProp<ViewStyle>;
}

const CIRCLE_SIZE = 24;

export function SelectionCircle({ selected, style }: SelectionCircleProps) {
  return (
    <View
      style={[
        styles.circle,
        selected ? styles.selected : styles.unselected,
        style,
      ]}
    >
      {selected && <View style={styles.checkmark} />}
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  unselected: {
    backgroundColor: Colors.brand.surface,
    borderWidth: 1.5,
    borderColor: Colors.brand.line,
  },
  selected: {
    backgroundColor: Colors.brand.primary,
    borderWidth: 0,
  },
  checkmark: {
    width: 5,
    height: 9,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: Colors.brand.onPrimary,
    transform: [{ rotate: '45deg' }, { translateY: -2 }],
  },
});
