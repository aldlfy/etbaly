/**
 * Bidi isolation utilities to prevent bidirectional text corruption
 * when mixing Arabic (RTL), English (LTR), and LaTeX / Math notation on the same line.
 */

/**
 * Wraps an LTR snippet (English or Math expression) in an isolated LTR span with <bdi>
 */
export function wrapLtrInBdi(text: string): string {
  if (!text) return '';
  return `<bdi dir="ltr" class="inline-ltr-snippet">${text}</bdi>`;
}

/**
 * Wraps raw math LaTeX so KaTeX renders inside an isolated LTR bidi container
 */
export function wrapMathInBdi(html: string): string {
  if (!html) return '';
  return `<span class="katex-bdi-wrapper" dir="ltr" style="unicode-bidi: isolate; display: inline-block;">${html}</span>`;
}

/**
 * Detects if a text fragment contains primarily Latin/English characters
 */
export function isLatinText(text: string): boolean {
  return /^[A-Za-z0-9\s.,!?:;'"()[\]{}+=*/\\<>-]+$/.test(text.trim());
}

/**
 * Automatically isolates Latin text sequences inside an Arabic string
 * so that commas, parentheses, and units don't jump positions in RTL.
 */
export function sanitizeMixedBidiString(input: string): string {
  if (!input) return '';
  // Wrap English phrases between parentheses or after math with bdi
  return input.replace(/([a-zA-Z0-9_\-./]{2,}(\s+[a-zA-Z0-9_\-./]+)*)/g, (match) => {
    return `<bdi dir="ltr">${match}</bdi>`;
  });
}
