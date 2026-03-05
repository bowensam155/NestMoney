// ============================================================
// NestMoney — Font Loader
// Loads all Noto Sans variants needed for 9 supported languages.
// Call loadFonts() in app/_layout.tsx before rendering.
//
// Download font files from https://fonts.google.com/noto
// and place them in assets/fonts/ before building.
// See assets/fonts/README.md for the full download list.
// ============================================================

import * as Font from 'expo-font';

export async function loadFonts(): Promise<void> {
  await Font.loadAsync({
    // --------------------------------------------------------
    // Noto Sans — Latin scripts
    // Covers: English (en), Spanish (es), Tagalog (tl),
    //         Vietnamese (vi), Mongolian Cyrillic (mn)
    // --------------------------------------------------------
    'NotoSans-Regular': require('../assets/fonts/NotoSans-Regular.ttf'),
    'NotoSans-Medium': require('../assets/fonts/NotoSans-Medium.ttf'),
    'NotoSans-SemiBold': require('../assets/fonts/NotoSans-SemiBold.ttf'),
    'NotoSans-Bold': require('../assets/fonts/NotoSans-Bold.ttf'),

    // --------------------------------------------------------
    // Noto Sans SC — Simplified Chinese (Mandarin / zh)
    // --------------------------------------------------------
    'NotoSansSC-Regular': require('../assets/fonts/NotoSansSC-Regular.otf'),
    'NotoSansSC-Medium': require('../assets/fonts/NotoSansSC-Medium.otf'),
    'NotoSansSC-Bold': require('../assets/fonts/NotoSansSC-Bold.otf'),

    // --------------------------------------------------------
    // Noto Sans TC — Traditional Chinese (Cantonese / yue)
    // --------------------------------------------------------
    'NotoSansTC-Regular': require('../assets/fonts/NotoSansTC-Regular.otf'),
    'NotoSansTC-Medium': require('../assets/fonts/NotoSansTC-Medium.otf'),
    'NotoSansTC-Bold': require('../assets/fonts/NotoSansTC-Bold.otf'),

    // --------------------------------------------------------
    // Noto Sans Devanagari — Hindi (hi)
    // --------------------------------------------------------
    'NotoSansDevanagari-Regular': require('../assets/fonts/NotoSansDevanagari-Regular.ttf'),
    'NotoSansDevanagari-Medium': require('../assets/fonts/NotoSansDevanagari-Medium.ttf'),
    'NotoSansDevanagari-Bold': require('../assets/fonts/NotoSansDevanagari-Bold.ttf'),

    // --------------------------------------------------------
    // Noto Sans Gurmukhi — Punjabi (pa)
    // --------------------------------------------------------
    'NotoSansGurmukhi-Regular': require('../assets/fonts/NotoSansGurmukhi-Regular.ttf'),
    'NotoSansGurmukhi-Medium': require('../assets/fonts/NotoSansGurmukhi-Medium.ttf'),
    'NotoSansGurmukhi-Bold': require('../assets/fonts/NotoSansGurmukhi-Bold.ttf'),
  });
}

// ============================================================
// Font family map — use with fontFamily style prop
// ============================================================

export const fontFamilyMap: Record<string, { regular: string; medium: string; bold: string }> = {
  en: {
    regular: 'NotoSans-Regular',
    medium: 'NotoSans-Medium',
    bold: 'NotoSans-Bold',
  },
  es: {
    regular: 'NotoSans-Regular',
    medium: 'NotoSans-Medium',
    bold: 'NotoSans-Bold',
  },
  tl: {
    regular: 'NotoSans-Regular',
    medium: 'NotoSans-Medium',
    bold: 'NotoSans-Bold',
  },
  vi: {
    regular: 'NotoSans-Regular',
    medium: 'NotoSans-Medium',
    bold: 'NotoSans-Bold',
  },
  mn: {
    // Mongolian Cyrillic is covered by the standard Noto Sans Latin set
    regular: 'NotoSans-Regular',
    medium: 'NotoSans-Medium',
    bold: 'NotoSans-Bold',
  },
  zh: {
    regular: 'NotoSansSC-Regular',
    medium: 'NotoSansSC-Medium',
    bold: 'NotoSansSC-Bold',
  },
  yue: {
    regular: 'NotoSansTC-Regular',
    medium: 'NotoSansTC-Medium',
    bold: 'NotoSansTC-Bold',
  },
  hi: {
    regular: 'NotoSansDevanagari-Regular',
    medium: 'NotoSansDevanagari-Medium',
    bold: 'NotoSansDevanagari-Bold',
  },
  pa: {
    regular: 'NotoSansGurmukhi-Regular',
    medium: 'NotoSansGurmukhi-Medium',
    bold: 'NotoSansGurmukhi-Bold',
  },
};
