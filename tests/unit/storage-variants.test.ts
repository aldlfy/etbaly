import { describe, it, expect } from 'vitest';
import { exportExamToJson, importExamFromJson } from '@/features/storage/utils/examJson';
import { generateVariantQuestions } from '@/features/exam-variants/utils/shuffler';
import { DEFAULT_EXAM_HEADER } from '@/features/exam-header/types';
import { DEFAULT_PAGE_SETTINGS } from '@/features/layout/types';
import type { QuestionData } from '@/features/questions/types';

describe('Phase 5: Storage, Export & Variant Shuffling Engine', () => {
  const sampleQuestions: QuestionData[] = [
    {
      id: 'q-mcq-1',
      type: 'mcq',
      prompt: 'ما هي وحدة قياس القوة في النظام الدولي؟',
      marks: 10,
      direction: 'rtl',
      mcqOptions: [
        { id: '1', letter: 'أ', text: 'نيوتن' },
        { id: '2', letter: 'ب', text: 'جول' },
        { id: '3', letter: 'ج', text: 'واط' },
        { id: '4', letter: 'د', text: 'باسكال' },
      ],
    },
    {
      id: 'q-essay-2',
      type: 'essay',
      prompt: 'عرف الطاقة الميكانيكية واذكر صورتيها.',
      marks: 10,
      direction: 'rtl',
    },
  ];

  it('exports exam to valid JSON and restores it completely', () => {
    const jsonStr = exportExamToJson(
      'exam-test-101',
      'امتحان الفيزياء النهائي',
      DEFAULT_EXAM_HEADER,
      DEFAULT_PAGE_SETTINGS,
      sampleQuestions
    );

    expect(jsonStr).toContain('ExamForge');
    expect(jsonStr).toContain('نيوتن');

    const imported = importExamFromJson(jsonStr);
    expect(imported.id).toBe('exam-test-101');
    expect(imported.title).toBe('امتحان الفيزياء النهائي');
    expect(imported.questions).toHaveLength(2);
    expect(imported.questions[0].type).toBe('mcq');
    expect(imported.questions[0].mcqOptions).toHaveLength(4);
  });

  it('throws helpful error on invalid JSON import', () => {
    expect(() => importExamFromJson('invalid json string {')).toThrow('فشل استيراد الاختبار');
    expect(() => importExamFromJson('{"invalid": true}')).toThrow('الملف لا يحتوي على مصفوفة أسئلة صحيحة');
  });

  it('generates Model A with identical original order', () => {
    const modelA = generateVariantQuestions(sampleQuestions, 'model_a');
    expect(modelA).toHaveLength(2);
    expect(modelA[0].mcqOptions?.[0].text).toBe('نيوتن');
    expect(modelA[0].mcqOptions?.[0].letter).toBe('أ');
  });

  it('generates Model B by shuffling MCQ choices while preserving Arabic letters', () => {
    const modelB = generateVariantQuestions(sampleQuestions, 'model_b');
    expect(modelB).toHaveLength(2);

    const options = modelB[0].mcqOptions;
    expect(options).toHaveLength(4);

    // Letters must be in order أ، ب، ج، د
    expect(options?.[0].letter).toBe('أ');
    expect(options?.[1].letter).toBe('ب');
    expect(options?.[2].letter).toBe('ج');
    expect(options?.[3].letter).toBe('د');

    // All original texts must still exist
    const texts = options?.map((o) => o.text);
    expect(texts).toContain('نيوتن');
    expect(texts).toContain('جول');
    expect(texts).toContain('واط');
    expect(texts).toContain('باسكال');
  });
});
