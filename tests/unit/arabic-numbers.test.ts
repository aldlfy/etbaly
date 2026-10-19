import { describe, it, expect } from 'vitest';
import { 
  toEasternArabicDigits, 
  toWesternArabicDigits, 
  formatDigits, 
  getAlphabeticalIndex 
} from '@/lib/arabic-numbers';

describe('Arabic Numbers & Formatting Utility', () => {
  it('converts Western digits to Eastern Arabic digits correctly', () => {
    expect(toEasternArabicDigits(1234567890)).toBe('١٢٣٤٥٦٧٨٩٠');
    expect(toEasternArabicDigits('Page 1 of 5')).toBe('Page ١ of ٥');
  });

  it('converts Eastern Arabic digits to Western digits correctly', () => {
    expect(toWesternArabicDigits('١٢٣٤٥٦٧٨٩٠')).toBe('1234567890');
    expect(toWesternArabicDigits('السؤال رقم ٤')).toBe('السؤال رقم 4');
  });

  it('formats numbers according to chosen style', () => {
    expect(formatDigits(25, 'eastern')).toBe('٢٥');
    expect(formatDigits(25, 'western')).toBe('25');
  });

  it('provides correct Arabic alphabetical indices for question parts', () => {
    expect(getAlphabeticalIndex(0)).toBe('أ');
    expect(getAlphabeticalIndex(1)).toBe('ب');
    expect(getAlphabeticalIndex(2)).toBe('ج');
    expect(getAlphabeticalIndex(3)).toBe('د');
    expect(getAlphabeticalIndex(4)).toBe('هـ');
  });
});
