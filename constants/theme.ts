const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

// process.env.EXPO_OS is resolved at build time, enabling dead-code elimination
// per-platform. Prefer this over Platform.select which is evaluated at runtime.
const os = process.env.EXPO_OS;

export const Fonts = {
  sans:
    os === 'ios'
      ? 'system-ui'
      : os === 'web'
        ? "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
        : 'normal',
  serif:
    os === 'ios'
      ? 'ui-serif'
      : os === 'web'
        ? "Georgia, 'Times New Roman', serif"
        : 'serif',
  rounded:
    os === 'ios'
      ? 'ui-rounded'
      : os === 'web'
        ? "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif"
        : 'normal',
  mono:
    os === 'ios'
      ? 'ui-monospace'
      : os === 'web'
        ? "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
        : 'monospace',
};
