import { describe, it, expect } from 'vitest';
import { renderLatex } from '@/lib/katex';
import { wrapLtrInBdi, wrapMathInBdi, isLatinText } from '@/features/editor/utils/bidi';
import { SAMPLE_QUESTIONS } from '@/features/editor/data/sampleQuestions';

describe('Phase 2 - Math/Physics/Language Editor Suite', () => {
  it('renders KaTeX formulas cleanly to HTML string', () => {
    const fractionHtml = renderLatex('\\frac{a}{b}');
    expect(fractionHtml).toContain('katex');
    expect(fractionHtml).toContain('katex-bdi-wrapper');

    const integralHtml = renderLatex('\\int_0^1 x^2 dx');
    expect(integralHtml).toContain('katex');
  });

  it('handles KaTeX render errors gracefully without throwing', () => {
    const brokenLatex = '\\invalidMacro{123';
    const output = renderLatex(brokenLatex, { throwOnError: false });
    expect(output).toBeDefined();
  });

  it('bidi utilities wrap LTR English and math snippets with bdi tags', () => {
    const wrapped = wrapLtrInBdi('m/s^2');
    expect(wrapped).toBe('<bdi dir="ltr" class="inline-ltr-snippet">m/s^2</bdi>');

    const wrappedMath = wrapMathInBdi('<span>x=5</span>');
    expect(wrappedMath).toContain('dir="ltr"');
    expect(wrappedMath).toContain('unicode-bidi: isolate');
  });

  it('detects Latin text correctly', () => {
    expect(isLatinText('Newton 2nd Law')).toBe(true);
    expect(isLatinText('قانون نيوتن الثاني')).toBe(false);
  });

  it('contains exactly 30 curated sample questions covering all 6 subjects', () => {
    expect(SAMPLE_QUESTIONS).toHaveLength(30);

    const categories = ['algebra', 'calculus', 'mechanics', 'circuits', 'chemistry', 'english'] as const;
    categories.forEach((cat) => {
      const count = SAMPLE_QUESTIONS.filter((q) => q.category === cat).length;
      expect(count).toBe(5);
    });
  });

  it('renders all 30 sample questions math formulas without errors', () => {
    SAMPLE_QUESTIONS.forEach((q) => {
      expect(q.title).toBeTruthy();
      expect(q.marks).toBeGreaterThan(0);
      expect(['rtl', 'ltr']).toContain(q.direction);

      // Parse $...$ formulas in question content
      const matches = q.content.match(/\$([^$]+)\$/g);
      if (matches) {
        matches.forEach((mathDelimited) => {
          const formula = mathDelimited.slice(1, -1);
          const rendered = renderLatex(formula);
          expect(rendered).toContain('katex');
        });
      }
    });
  });
});
