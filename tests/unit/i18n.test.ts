import { describe, it, expect } from 'vitest';
import i18n from '@/i18n/config';

describe('i18n configuration and dictionary', () => {
  it('initializes with Arabic as default language', () => {
    expect(i18n.language).toBe('ar');
  });

  it('translates core application keys in Arabic', () => {
    expect(i18n.t('app.title')).toBe('ExamForge');
    expect(i18n.t('app.subtitle')).toBe('صانع الاختبارات المدرسية العربي');
    expect(i18n.t('subscription.pro')).toBe('الاحترافية (Pro)');
  });

  it('updates document direction attribute to rtl for Arabic', () => {
    expect(document.documentElement.dir).toBe('rtl');
    expect(document.documentElement.lang).toBe('ar');
  });

  it('switches to English and updates direction to ltr', async () => {
    await i18n.changeLanguage('en');
    expect(i18n.language).toBe('en');
    expect(document.documentElement.dir).toBe('ltr');
    expect(i18n.t('common.save')).toBe('Save');

    // Switch back to Arabic
    await i18n.changeLanguage('ar');
    expect(i18n.language).toBe('ar');
    expect(document.documentElement.dir).toBe('rtl');
    expect(i18n.t('common.save')).toBe('حفظ');
  });
});
