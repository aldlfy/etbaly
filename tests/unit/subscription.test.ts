import { describe, it, expect } from 'vitest';
import { 
  formatActivationCode, 
  isValidActivationCodeFormat, 
  exportCodesToCsv 
} from '@/features/subscription/utils/codeValidator';

describe('Phase 6: Activation Codes & Subscription Engine', () => {
  it('formats raw string into XXXX-XXXX-XXXX uppercase pattern', () => {
    const raw = 'abcd1234efgh';
    expect(formatActivationCode(raw)).toBe('ABCD-1234-EFGH');

    const formattedWithSymbols = 'ab-cd-12-34-ef-gh';
    expect(formatActivationCode(formattedWithSymbols)).toBe('ABCD-1234-EFGH');

    const lowercaseWithExtra = 'k9m2x8j4w7p5999';
    expect(formatActivationCode(lowercaseWithExtra)).toBe('K9M2-X8J4-W7P5');
  });

  it('validates 12-char formatted codes accurately', () => {
    expect(isValidActivationCodeFormat('ABCD-1234-EFGH')).toBe(true);
    expect(isValidActivationCodeFormat('K9M2-X8J4-W7P5')).toBe(true);

    // Invalid codes
    expect(isValidActivationCodeFormat('ABCD-1234-EFG')).toBe(false); // too short
    expect(isValidActivationCodeFormat('ABCD1234EFGH')).toBe(false); // missing hyphens
    expect(isValidActivationCodeFormat('abcd-1234-efgh')).toBe(false); // lowercase
    expect(isValidActivationCodeFormat('ABCD-1234-EFGH-IJKL')).toBe(false); // too long
  });

  it('generates well-formed CSV for code export', () => {
    const sampleBatch = [
      { code: 'ABCD-1234-EFGH', plan: 'pro', duration_days: 30, note: 'مدرسة النور' },
      { code: 'WXYZ-5678-MNOP', plan: 'pro', duration_days: 90, note: 'دورة تدريبية' },
    ];

    const csv = exportCodesToCsv(sampleBatch);
    expect(csv).toContain('Code,Plan,DurationDays,Note');
    expect(csv).toContain('"ABCD-1234-EFGH","pro","30","مدرسة النور"');
    expect(csv).toContain('"WXYZ-5678-MNOP","pro","90","دورة تدريبية"');
  });
});
