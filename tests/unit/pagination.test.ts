import { describe, it, expect } from 'vitest';
import { 
  getPaperDimensions, 
  estimateQuestionHeightMm, 
  paginateQuestions,
  calculateFitOptimizer
} from '@/features/layout/utils/pagination';
import { DEFAULT_PAGE_SETTINGS } from '@/features/layout/types';
import { DEFAULT_EXAM_HEADER } from '@/features/exam-header/types';
import type { QuestionData } from '@/features/questions/types';

describe('Pagination and Layout Engine', () => {
  it('calculates correct paper dimensions for various sizes and orientations', () => {
    const a4Portrait = getPaperDimensions('A4', 'portrait');
    expect(a4Portrait.widthMm).toBe(210);
    expect(a4Portrait.heightMm).toBe(297);

    const a4Landscape = getPaperDimensions('A4', 'landscape');
    expect(a4Landscape.widthMm).toBe(297);
    expect(a4Landscape.heightMm).toBe(210);

    const a3Portrait = getPaperDimensions('A3', 'portrait');
    expect(a3Portrait.widthMm).toBe(297);
    expect(a3Portrait.heightMm).toBe(420);

    const letterPortrait = getPaperDimensions('Letter', 'portrait');
    expect(letterPortrait.widthMm).toBe(215.9);
    expect(letterPortrait.heightMm).toBe(279.4);
  });

  it('estimates question heights according to question type and column layout', () => {
    const essayQ: QuestionData = {
      id: 'q1',
      type: 'essay',
      prompt: 'اشرح مبدأ الحث الكهرومغناطيسي لفاراداي مع الرسم البياني والتطبيقات العملية في المحولات.',
      marks: 10,
      direction: 'rtl',
    };

    const h1Col = estimateQuestionHeightMm(essayQ, DEFAULT_PAGE_SETTINGS);
    const h2Col = estimateQuestionHeightMm(essayQ, { ...DEFAULT_PAGE_SETTINGS, columns: 2 });
    
    expect(h1Col).toBeGreaterThan(15);
    expect(h2Col).toBeLessThan(h1Col); // 2-columns footprint should be smaller

    const calcQ: QuestionData = {
      id: 'q2',
      type: 'calculation',
      prompt: 'احسب تسارع الجسم والشغل المنجز:',
      marks: 20,
      direction: 'rtl',
      answerSpaceType: 'dotted_lines',
      answerSpaceLines: 8,
    };

    const hCalc = estimateQuestionHeightMm(calcQ, DEFAULT_PAGE_SETTINGS);
    expect(hCalc).toBeGreaterThan(h1Col); // calculation with 8 dotted lines takes more height
  });

  it('paginates single page when questions fit cleanly', () => {
    const questions: QuestionData[] = [
      {
        id: 'q1',
        type: 'essay',
        prompt: 'عرف ما يأتي: الزخم، الطاقة الكامنة، التسارع المركزي.',
        marks: 15,
        direction: 'rtl',
      },
      {
        id: 'q2',
        type: 'true_false',
        prompt: 'ضع إشارة صح أو خطأ أمام العبارات الآتية:',
        marks: 15,
        direction: 'rtl',
        tfStatements: [
          { id: '1', text: 'سرعة الضوء ثابتة في الفراغ.', marks: 5 },
          { id: '2', text: 'الوزن كمية متجهة تقاس بالنيوتن.', marks: 5 },
        ],
      },
    ];

    const pages = paginateQuestions(questions, DEFAULT_EXAM_HEADER, DEFAULT_PAGE_SETTINGS);
    expect(pages).toHaveLength(1);
    expect(pages[0].isFirstPage).toBe(true);
    expect(pages[0].isLastPage).toBe(true);
    expect(pages[0].pageNumber).toBe(1);
    expect(pages[0].questionIds).toHaveLength(2);
  });

  it('respects pageBreakBefore flag to start question on a new page', () => {
    const questions: QuestionData[] = [
      {
        id: 'q1',
        type: 'essay',
        prompt: 'السؤال الأول',
        marks: 20,
        direction: 'rtl',
      },
      {
        id: 'q2',
        type: 'essay',
        prompt: 'السؤال الثاني',
        marks: 20,
        direction: 'rtl',
        pageBreakBefore: true, // Manual break!
      },
    ];

    const pages = paginateQuestions(questions, DEFAULT_EXAM_HEADER, DEFAULT_PAGE_SETTINGS);
    expect(pages).toHaveLength(2);
    expect(pages[0].questionIds).toEqual(['q1']);
    expect(pages[1].questionIds).toEqual(['q2']);
    expect(pages[0].isFirstPage).toBe(true);
    expect(pages[1].isLastPage).toBe(true);
  });

  it('suggests optimal compact layout settings when fitting to 1 page', () => {
    // Create 7 large questions that exceed 1 standard page
    const heavyQuestions: QuestionData[] = Array.from({ length: 6 }).map((_, i) => ({
      id: `heavy-q${i}`,
      type: 'calculation',
      prompt: `مسألة شاملة رقم ${i + 1} تتضمن حساب القوة والشغل والطاقة والقدرة مع رسم المخطط البياني:`,
      marks: 15,
      direction: 'rtl',
      answerSpaceType: 'dotted_lines',
      answerSpaceLines: 6,
    }));

    const result = calculateFitOptimizer(heavyQuestions, DEFAULT_EXAM_HEADER, DEFAULT_PAGE_SETTINGS, 1);
    expect(result.targetPages).toBe(1);
    expect(result.recommendedSettings).toBeDefined();
    // It should suggest tighter margins or columns
    if (result.recommendedSettings.fontSizePt) {
      expect(result.recommendedSettings.fontSizePt).toBeLessThanOrEqual(11);
    }
  });
});
