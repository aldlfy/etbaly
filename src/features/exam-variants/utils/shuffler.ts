import type { QuestionData } from '@/features/questions/types';

export type ExamVariantType = 'original' | 'model_a' | 'model_b';

export interface VariantComparisonItem {
  questionNumber: number;
  type: string;
  originalAnswerMap?: string;
  variantAnswerMap?: string;
}

/**
 * Deterministic pseudo-random shuffle based on seed string
 */
function seededShuffle<T>(array: T[], seed: number): T[] {
  const result = [...array];
  let s = seed;
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const rnd = s / 233280;
    const j = Math.floor(rnd * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Generate Variant B by shuffling MCQ choices and/or question parts
 */
export function generateVariantQuestions(
  questions: QuestionData[],
  variant: 'model_a' | 'model_b'
): QuestionData[] {
  if (variant === 'model_a') {
    // Model A is canonical order
    return questions.map((q) => ({ ...q }));
  }

  // Model B: shuffle MCQ options and re-letter them (أ، ب، ج، د)
  const letters = ['أ', 'ب', 'ج', 'د', 'هـ'];

  return questions.map((q, qIndex) => {
    if (q.type === 'mcq' && q.mcqOptions && q.mcqOptions.length > 1) {
      const seed = 1000 + qIndex * 37;
      const shuffled = seededShuffle(q.mcqOptions, seed);
      const reIndexed = shuffled.map((opt, optIdx) => ({
        ...opt,
        letter: letters[optIdx] || opt.letter,
      }));
      return {
        ...q,
        mcqOptions: reIndexed,
      };
    }

    if (q.type === 'matching' && q.matchingPairs && q.matchingPairs.length > 1) {
      const seed = 2000 + qIndex * 43;
      const rightItems = q.matchingPairs.map((p) => p.rightItem);
      const shuffledRight = seededShuffle(rightItems, seed);
      const reMatched = q.matchingPairs.map((p, idx) => ({
        ...p,
        rightItem: shuffledRight[idx],
      }));
      return {
        ...q,
        matchingPairs: reMatched,
      };
    }

    return { ...q };
  });
}
