import { describe, it, expect } from 'vitest';
import type { QuestionData } from '@/features/questions/types';
import { 
  computeTotalMarks, 
  formatMarksLabel, 
  getQuestionHeaderLabel, 
  reorderQuestions, 
  moveQuestion, 
  duplicateQuestion 
} from '@/features/questions/utils/numbering';

describe('Phase 3 - Question Builder Engine Suite', () => {
  const sampleQuestions: QuestionData[] = [
    {
      id: 'q1',
      type: 'essay',
      prompt: 'ما هي شروط التوازن الميكانيكي للجسم الجاسئ؟',
      marks: 10,
      direction: 'rtl',
    },
    {
      id: 'q2',
      type: 'multi_part',
      prompt: 'أجب عن الفرعين الآتيين:',
      marks: 20, // root
      parts: [
        { id: 'p1', letter: 'أ', content: 'فرع أ', marks: 12 },
        { id: 'p2', letter: 'ب', content: 'فرع ب', marks: 8 },
      ],
      direction: 'rtl',
    },
    {
      id: 'q3',
      type: 'mcq',
      prompt: 'اختر الإجابة الصحيحة:',
      marks: 15,
      direction: 'rtl',
    },
  ];

  it('calculates total marks accurately across single and multi-part questions', () => {
    // q1 (10) + q2 parts (12 + 8 = 20) + q3 (15) = 45
    const total = computeTotalMarks(sampleQuestions);
    expect(total).toBe(45);
  });

  it('formats marks labels correctly in Eastern and Western digit styles', () => {
    expect(formatMarksLabel(1)).toBe('(درجة واحدة)');
    expect(formatMarksLabel(2)).toBe('(درجتان)');
    expect(formatMarksLabel(5, 'eastern')).toBe('(٥ درجات)');
    expect(formatMarksLabel(5, 'western')).toBe('(5 درجات)');
    expect(formatMarksLabel(25, 'eastern')).toBe('(٢٥ درجة)');
    expect(formatMarksLabel(25, 'western')).toBe('(25 درجة)');
  });

  it('generates correct question header labels in compact and ordinal styles', () => {
    expect(getQuestionHeaderLabel(0, 'eastern', 'compact')).toBe('س١');
    expect(getQuestionHeaderLabel(0, 'western', 'compact')).toBe('س1');
    expect(getQuestionHeaderLabel(1, 'eastern', 'compact')).toBe('س٢');
    expect(getQuestionHeaderLabel(1, 'western', 'compact')).toBe('س2');

    expect(getQuestionHeaderLabel(0, 'eastern', 'ordinal')).toBe('السؤال الأول');
    expect(getQuestionHeaderLabel(1, 'eastern', 'ordinal')).toBe('السؤال الثاني');
    expect(getQuestionHeaderLabel(2, 'eastern', 'ordinal')).toBe('السؤال الثالث');
  });

  it('reorders questions array and moves questions up and down safely', () => {
    // Move q2 up -> becomes first item
    const movedUp = moveQuestion(sampleQuestions, 'q2', 'up');
    expect(movedUp[0].id).toBe('q2');
    expect(movedUp[1].id).toBe('q1');

    // Move q1 down
    const movedDown = moveQuestion(sampleQuestions, 'q1', 'down');
    expect(movedDown[0].id).toBe('q2');
    expect(movedDown[1].id).toBe('q1');

    // Boundary check: cannot move first item up
    const noOpUp = moveQuestion(sampleQuestions, 'q1', 'up');
    expect(noOpUp[0].id).toBe('q1');

    // Arbitrary reorder
    const arbitrary = reorderQuestions(sampleQuestions, 0, 2);
    expect(arbitrary[2].id).toBe('q1');
  });

  it('duplicates a question correctly with unique ID and cloned content', () => {
    const duplicated = duplicateQuestion(sampleQuestions, 'q1');
    expect(duplicated).toHaveLength(sampleQuestions.length + 1);

    // Duplicated item is inserted directly after q1
    expect(duplicated[0].id).toBe('q1');
    expect(duplicated[1].id).not.toBe('q1');
    expect(duplicated[1].prompt).toBe(sampleQuestions[0].prompt);
    expect(duplicated[1].marks).toBe(sampleQuestions[0].marks);
    expect(duplicated[2].id).toBe('q2');
  });
});
