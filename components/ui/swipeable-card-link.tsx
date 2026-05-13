import { useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Colors, Typography } from '@/constants/theme';
import { CardLink, type CardLinkProps } from './card-link';
import { IconSymbol } from './icon-symbol';

interface SwipeableCardLinkProps extends CardLinkProps {
  onDelete?: () => void;
}

export function SwipeableCardLink({ onDelete, ...cardLinkProps }: SwipeableCardLinkProps) {
  const swipeableRef = useRef<Swipeable>(null);

  const handleDelete = () => {
    swipeableRef.current?.close();
    onDelete?.();
  };

  const renderRightActions = (_progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
    const translateX = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [0, 80],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View style={[styles.deleteContainer, { transform: [{ translateX }] }]}>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete} activeOpacity={0.8}>
          <IconSymbol name="trash" size={20} color={Colors.brand.onPrimary} />
          <Text style={styles.deleteText}>{'폴더에서\n삭제'}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      rightThreshold={40}
      overshootRight={false}
      containerStyle={styles.swipeableContainer}
    >
      <CardLink {...cardLinkProps} />
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  swipeableContainer: {
    borderRadius: 12,
  },
  deleteContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: Colors.brand.textWarning,
    borderRadius: 12,
    width: 72,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  deleteText: {
    ...Typography.bold12,
    color: Colors.brand.onPrimary,
  },
});
