const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

// Brand color tokens (from Figma Design System)
const primaryColor = '#71A896';
const primaryDeepColor = '#5F9685';
const softMintColor = '#DDE9E4';
const backgroundBrandColor = '#F4F8F6';
const textPrimaryColor = '#1D2623';
const lineColor = '#D8E2DE';
const textSecondaryColor = '#65736D';
const textHintColor = '#8A9691';
const textWarningColor = '#E61F1F';
const textCautionColor = '#C9A227';
const surfaceColor = '#FFFFFF';
const onPrimaryColor = '#FFFFFF';
const shadowColor = '#000000';
const transparentColor = 'transparent';
const linkColor = tintColorLight;
const mutedIconColor = '#808080';
const safeTextColor = '#2F6F5F';
const cautionBackgroundColor = '#F5ECC8';
const cautionTextColor = '#8A6500';
const dangerBackgroundColor = '#F5C8C8';
const selectedOverlayColor = 'rgba(0,0,0,0.08)';
const modalBackdropColor = 'rgba(0,0,0,0.4)';
const inverseSubtleOverlayColor = 'rgba(255,255,255,0.08)';
const folderCardBodyColor = '#FAFCFB';

const socialButtonBackgroundColor = '#FFFFFF';
const socialButtonBorderColor = lineColor;
const googleIconColor = '#4285F4';
const appleButtonBackgroundColor = '#111111';
const appleButtonTextColor = '#FFFFFF';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    parallaxHeader: '#D0D0D0',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    parallaxHeader: '#353636',
  },
  brand: {
    primary: primaryColor,
    primaryDeep: primaryDeepColor,
    softMint: softMintColor,
    background: backgroundBrandColor,
    surface: surfaceColor,
    onPrimary: onPrimaryColor,
    text: textPrimaryColor,
    line: lineColor,
    textSecondary: textSecondaryColor,
    textHint: textHintColor,
    textWarning: textWarningColor,
    textCaution: textCautionColor,
    link: linkColor,
    mutedIcon: mutedIconColor,
    shadow: shadowColor,
    transparent: transparentColor,
    overlaySelected: selectedOverlayColor,
    overlayBackdrop: modalBackdropColor,
    overlayInverseSubtle: inverseSubtleOverlayColor,
    verdict: {
      safe: {
        background: softMintColor,
        text: safeTextColor,
        accent: primaryColor,
      },
      caution: {
        background: cautionBackgroundColor,
        text: cautionTextColor,
        accent: textCautionColor,
      },
      danger: {
        background: dangerBackgroundColor,
        text: textWarningColor,
        accent: textWarningColor,
      },
    },
    folderGradientStart: '#8FE2C6',
    folderGradientEnd: '#499B80',
    folderCard: {
      body: folderCardBodyColor,
    },
  },
  social: {
    buttonBackground: socialButtonBackgroundColor,
    buttonBorder: socialButtonBorderColor,
    googleIcon: googleIconColor,
    appleButtonBackground: appleButtonBackgroundColor,
    appleButtonText: appleButtonTextColor,
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

// Font size tokens (from Figma Design System)
const fontSizeDisplay = 32;
const fontSizeDisplayMedium = 30;
const fontSizePageTitle = 24;
const fontSizeTitle = 22;
const fontSizeSectionTitle = 20;
const fontSizeSection = 18;
const fontSizeProfile = 17;
const fontSizeBody = 16;
const fontSizeSummary = 14;
const fontSizeCaption = 13;
const fontSizeUrl = 12;
const fontSizeBold12 = 12;
const fontSizeRegular12 = 12;

// Font weight tokens (from Figma Design System)
const fontWeightBold = '700' as const;
const fontWeightRegular = '400' as const;

export const Typography = {
  display: { fontSize: fontSizeDisplay, fontWeight: fontWeightBold },
  displayMedium: { fontSize: fontSizeDisplayMedium, fontWeight: fontWeightBold },
  pageTitle: { fontSize: fontSizePageTitle, fontWeight: fontWeightBold },
  title: { fontSize: fontSizeTitle, fontWeight: fontWeightBold },
  sectionTitle: { fontSize: fontSizeSectionTitle, fontWeight: fontWeightBold },
  section: { fontSize: fontSizeSection, fontWeight: fontWeightBold },
  profile: { fontSize: fontSizeProfile, fontWeight: fontWeightBold },
  body: { fontSize: fontSizeBody, fontWeight: fontWeightRegular },
  summary: { fontSize: fontSizeSummary, fontWeight: fontWeightRegular },
  caption: { fontSize: fontSizeCaption, fontWeight: fontWeightBold },
  url: { fontSize: fontSizeUrl, fontWeight: fontWeightRegular, textDecorationLine: 'underline' as const },
  bold12: { fontSize: fontSizeBold12, fontWeight: fontWeightBold },
  regular12: { fontSize: fontSizeRegular12, fontWeight: fontWeightRegular },
};

export const ComponentTokens = {
  folderCard: {
    defaultWidth: 144,
    height: 128,
    bodyTop: 16,
    bodyMinHeight: 112,
    tabWidth: 72,
    tabLeft: 10,
    horizontalPadding: 14,
    verticalPadding: 18,
    menuSize: 22,
    radius: 12,
    tabRadius: 8,
    touchHitSlop: 8,
    pressedScale: 0.98,
    borderWidth: 1,
    hiddenBorderWidth: 0,
    origin: 0,
    headerGap: 8,
    folderNameLines: 2,
    compact: {
      height: 116,
      bodyTop: 14,
      bodyMinHeight: 102,
      tabWidth: 64,
      horizontalPadding: 12,
      verticalPadding: 14,
      menuSize: 20,
    },
  },
} as const;
