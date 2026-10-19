import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import ar from './locales/ar.json';
import en from './locales/en.json';

const resources = {
  ar: { translation: ar },
  en: { translation: en },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ar',
    lng: 'ar', // Arabic default as required
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

// Automatically update HTML dir and lang attributes on language change
const updateDocumentAttributes = (lang: string) => {
  const isRtl = lang === 'ar';
  document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
  document.documentElement.lang = lang;
};

// Initial setup
updateDocumentAttributes(i18n.language || 'ar');

i18n.on('languageChanged', (lang) => {
  updateDocumentAttributes(lang);
});

export default i18n;
