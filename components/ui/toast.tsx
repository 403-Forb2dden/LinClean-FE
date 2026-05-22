import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Colors, Typography } from '@/constants/theme';
import { IconSymbol } from './icon-symbol';

interface ToastProps {
  visible: boolean;
  message: string;
  duration?: number;
  placement?: 'center' | 'top';
  topOffset?: number;
  onHide?: () => void;
}

export function Toast({
  visible,
  message,
  duration = 2500,
  placement = 'center',
  topOffset = 64,
  onHide,
}: ToastProps) {
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
    <Animated.View
      style={[
        styles.container,
        placement === 'top' ? [styles.topContainer, { top: topOffset }] : styles.centerContainer,
        { opacity },
      ]}
      pointerEvents="none"
    >
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
    left: 0,
    right: 0,
    zIndex: 100,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  centerContainer: {
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  topContainer: {
    justifyContent: 'flex-start',
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
    lineHeight: 20,
    fontWeight: '700',
    color: Colors.brand.onPrimary,
  },
});
