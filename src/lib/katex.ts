import katex from 'katex';
import 'katex/dist/katex.min.css';
import { wrapMathInBdi } from '@/features/editor/utils/bidi';

export interface RenderMathOptions {
  displayMode?: boolean;
  throwOnError?: boolean;
}

/**
 * Renders raw LaTeX to an HTML string wrapped in a bidi-isolated LTR container
 */
export function renderLatex(latex: string, options: RenderMathOptions = {}): string {
  if (!latex || !latex.trim()) return '';

  const { displayMode = false, throwOnError = false } = options;

  try {
    const renderedHtml = katex.renderToString(latex.trim(), {
      displayMode,
      throwOnError,
      output: 'htmlAndMathml',
      strict: false,
    });

    return wrapMathInBdi(renderedHtml);
  } catch (error) {
    console.warn('KaTeX rendering error for latex:', latex, error);
    // Fallback safe rendering showing the raw code cleanly
    return `<span class="katex-error text-rose-500 font-mono text-xs" dir="ltr">${latex}</span>`;
  }
}
