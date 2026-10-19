/**
 * Formats a raw alphanumeric string into XXXX-XXXX-XXXX uppercase pattern
 */
export function formatActivationCode(input: string): string {
  const cleaned = input.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const parts: string[] = [];

  for (let i = 0; i < cleaned.length && i < 12; i += 4) {
    parts.push(cleaned.substring(i, i + 4));
  }

  return parts.join('-');
}

/**
 * Validates whether the code matches XXXX-XXXX-XXXX
 */
export function isValidActivationCodeFormat(code: string): boolean {
  return /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(code.trim());
}

/**
 * Generates client-side CSV string for batch codes
 */
export function exportCodesToCsv(
  codes: Array<{ code: string; plan: string; duration_days: number; note?: string }>
): string {
  const header = 'Code,Plan,DurationDays,Note\n';
  const rows = codes
    .map((c) => `"${c.code}","${c.plan}","${c.duration_days}","${c.note || ''}"`)
    .join('\n');
  return header + rows;
}
