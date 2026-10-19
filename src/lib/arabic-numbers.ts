const EASTERN_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
const ARABIC_ALPHABET_NUMBERING = [
  'أ', 'ب', 'ج', 'د', 'هـ', 'و', 'ز', 'ح', 'ط', 'ي',
  'ك', 'ل', 'م', 'ن', 'س', 'ع', 'ف', 'ص', 'ق', 'ر',
  'ش', 'ت', 'ث', 'خ', 'ذ', 'ض', 'ظ', 'غ'
];

/**
 * Converts Western digits (0-9) to Eastern Arabic digits (٠-٩)
 */
export function toEasternArabicDigits(value: string | number): string {
  return String(value).replace(/[0-9]/g, (digit) => EASTERN_DIGITS[parseInt(digit, 10)]);
}

/**
 * Converts Eastern Arabic digits (٠-٩) to Western digits (0-9)
 */
export function toWesternArabicDigits(value: string | number): string {
  return String(value).replace(/[٠-٩]/g, (char) => String(EASTERN_DIGITS.indexOf(char)));
}

/**
 * Formats a number based on the requested digit style
 */
export function formatDigits(value: string | number, style: 'eastern' | 'western' = 'eastern'): string {
  if (style === 'eastern') {
    return toEasternArabicDigits(value);
  }
  return toWesternArabicDigits(value);
}

/**
 * Generates question label: e.g. "السؤال الأول (١)", "س 1", "أ)", "ب)"
 */
export function getAlphabeticalIndex(index: number): string {
  if (index >= 0 && index < ARABIC_ALPHABET_NUMBERING.length) {
    return ARABIC_ALPHABET_NUMBERING[index];
  }
  return String(index + 1);
}
