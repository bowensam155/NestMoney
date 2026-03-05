// ============================================================
// NestMoney — Design Tokens
// Source: DESIGN.md
// ============================================================

export const Colors = {
  // Primary
  accent: '#F97316',       // Saffron Orange — buttons, active tab, key highlights
  primaryDark: '#1E293B',  // Dark Navy — headers, important text

  // Backgrounds
  background: '#FFFFFF',   // Screen backgrounds
  surface: '#F8FAFC',      // Cards, input backgrounds
  skeletonBase: '#F1F5F9', // Skeleton loading base
  skeletonHighlight: '#E2E8F0', // Skeleton loading shimmer

  // Borders
  border: '#E2E8F0',

  // Text
  textPrimary: '#1E293B',
  textSecondary: '#94A3B8',
  textDisabled: '#CBD5E1',
  textOnAccent: '#FFFFFF',

  // Semantic
  success: '#22C55E',
  warning: '#EAB308',
  danger: '#EF4444',
  dangerSurface: '#FEF2F2',

  // Charts
  chartFill: '#C7D2FE',      // Default bar — Soft Lavender
  chartHighlight: '#F97316', // Active/selected bar

  // Tab bar
  tabActive: '#F97316',
  tabInactive: '#94A3B8',
} as const;

export const Typography = {
  // Font sizes
  sizeDisplay: 32,
  sizeH1: 24,
  sizeH2: 20,
  sizeH3: 17,
  sizeBody: 15,
  sizeBodySmall: 13,
  sizeLabel: 11,
  sizeButton: 16,

  // Font weights
  weightRegular: '400' as const,
  weightMedium: '500' as const,
  weightSemiBold: '600' as const,
  weightBold: '700' as const,
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 100,  // Pill buttons
} as const;

export const Shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  cardLarge: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 4,
  },
} as const;

export const Layout = {
  screenPaddingHorizontal: 16,
  cardMarginBottom: 12,
  tabBarHeight: 60,
} as const;

export const Animation = {
  buttonPress: 100,
  screenTransition: 250,
  bottomSheetOpen: 300,
  skeletonLoop: 800,
  celebration: 1200,
} as const;

export const AvatarSizes = {
  list: 32,
  card: 40,
  profileHeader: 56,
} as const;

export const IconSizes = {
  standard: 24,
  list: 20,
  inline: 16,
} as const;

export const ButtonDimensions = {
  height: 52,
  paddingHorizontal: 24,
} as const;

export const InputDimensions = {
  height: 52,
  paddingHorizontal: 16,
} as const;
