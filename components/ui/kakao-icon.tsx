import { View } from 'react-native';
import { Colors } from '@/constants/theme';

interface KakaoIconProps {
  size?: number;
  color?: string;
}

export function KakaoIcon({ size = 24, color = Colors.kakao.icon }: KakaoIconProps) {
  const bubbleH = size * 0.78;
  const tailW = size * 0.22;
  const tailH = size * 0.26;

  return (
    <View style={{ width: size, height: size }}>
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: bubbleH,
          backgroundColor: color,
          borderRadius: bubbleH / 2,
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: size * 0.27,
          width: 0,
          height: 0,
          borderLeftWidth: tailW / 2,
          borderRightWidth: tailW / 2,
          borderTopWidth: tailH,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderTopColor: color,
        }}
      />
    </View>
  );
}
