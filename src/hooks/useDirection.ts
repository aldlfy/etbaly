import { useTranslation } from 'react-i18next';

export function useDirection() {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const dir = isRtl ? 'rtl' : 'ltr';

  const setLanguage = (lang: 'ar' | 'en') => {
    i18n.changeLanguage(lang);
  };

  const toggleLanguage = () => {
    const next = i18n.language === 'ar' ? 'en' : 'ar';
    setLanguage(next);
  };

  return { isRtl, dir, language: i18n.language, setLanguage, toggleLanguage };
}
