import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import es from './locales/es.json';
import tl from './locales/tl.json';
import vi from './locales/vi.json';
import yue from './locales/yue.json';
import zh from './locales/zh.json';
import mn from './locales/mn.json';
import hi from './locales/hi.json';
import pa from './locales/pa.json';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    es: { translation: es },
    tl: { translation: tl },
    vi: { translation: vi },
    yue: { translation: yue },
    zh: { translation: zh },
    mn: { translation: mn },
    hi: { translation: hi },
    pa: { translation: pa },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  compatibilityJSON: 'v3',
});

export default i18n;
