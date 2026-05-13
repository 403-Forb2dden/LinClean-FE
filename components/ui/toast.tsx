import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Colors, Typography } from '@/constants/theme';
import { IconSymbol } from './icon-symbol';

interface ToastProps {
  visible: boolean;
  message: string;
  duration?: number;
  onHide?: () => void;
}

export function Toast({ visible, message, duration = 2500, onHide }: ToastProps) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.delay(duration - 400),
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start(() => onHide?.());
    }
  }, [duration, onHide, opacity, visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { opacity }]} pointerEvents="none">
      <View style={styles.toast}>
        <IconSymbol name="checkmark.circle.fill" size={20} color={Colors.brand.primary} />
        <Text style={styles.message}>{message}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.brand.text,
    borderRadius: 100,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  message: {
    ...Typography.summary,
    fontWeight: '700',
    color: Colors.brand.onPrimary,
  },
});
