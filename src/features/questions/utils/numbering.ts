import type { QuestionData } from '../types';
import { formatDigits } from '@/lib/arabic-numbers';

const ARABIC_ORDINAL_NAMES = [
  'الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس',
  'السابع', 'الثامن', 'التاسع', 'العاشر', 'الحادي عشر', 'الثاني عشر'
];

/**
 * Calculates total marks for the entire exam, taking into account
 * root question marks or sum of multi-part question branches.
 */
export function computeTotalMarks(questions: QuestionData[]): number {
  return questions.reduce((total, q) => {
    if (q.type === 'multi_part' && q.parts && q.parts.length > 0) {
      const partsSum = q.parts.reduce((pSum, part) => pSum + (part.marks || 0), 0);
      return total + (partsSum > 0 ? partsSum : (q.marks || 0));
    }
    return total + (q.marks || 0);
  }, 0);
}

/**
 * Formats marks string: e.g. "(١٠ درجات)", "(10 درجات)", "(درجة واحدة)", "(درجتان)"
 */
export function formatMarksLabel(marks: number, digitStyle: 'eastern' | 'western' = 'eastern'): string {
  if (marks === 1) return '(درجة واحدة)';
  if (marks === 2) return '(درجتان)';
  if (marks >= 3 && marks <= 10) {
    return `(${formatDigits(marks, digitStyle)} درجات)`;
  }
  return `(${formatDigits(marks, digitStyle)} درجة)`;
}

/**
 * Generates question label: "س١", "س1" or "السؤال الأول"
 */
export function getQuestionHeaderLabel(
  index: number, 
  digitStyle: 'eastern' | 'western' = 'eastern',
  style: 'compact' | 'ordinal' = 'compact'
): string {
  if (style === 'ordinal' && index >= 0 && index < ARABIC_ORDINAL_NAMES.length) {
    return `السؤال ${ARABIC_ORDINAL_NAMES[index]}`;
  }
  return `س${formatDigits(index + 1, digitStyle)}`;
}

/**
 * Reorders questions array safely
 */
export function reorderQuestions(
  questions: QuestionData[], 
  fromIndex: number, 
  toIndex: number
): QuestionData[] {
  if (
    fromIndex < 0 || 
    fromIndex >= questions.length || 
    toIndex < 0 || 
    toIndex >= questions.length
  ) {
    return questions;
  }
  const result = [...questions];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  return result;
}

/**
 * Moves question up or down by 1 position
 */
export function moveQuestion(
  questions: QuestionData[], 
  id: string, 
  direction: 'up' | 'down'
): QuestionData[] {
  const index = questions.findIndex((q) => q.id === id);
  if (index === -1) return questions;

  const targetIndex = direction === 'up' ? index - 1 : index + 1;
  return reorderQuestions(questions, index, targetIndex);
}

/**
 * Duplicates a question right below the original with a new ID
 */
export function duplicateQuestion(questions: QuestionData[], id: string): QuestionData[] {
  const index = questions.findIndex((q) => q.id === id);
  if (index === -1) return questions;

  const target = questions[index];
  const newId = 'q-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);

  const clone: QuestionData = {
    ...JSON.parse(JSON.stringify(target)),
    id: newId,
    title: target.title ? `${target.title} (نسخة)` : undefined,
  };

  const result = [...questions];
  result.splice(index + 1, 0, clone);
  return result;
}
