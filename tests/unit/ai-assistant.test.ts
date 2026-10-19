import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateAIQuestion } from '@/features/ai-assistant/services/aiService';
import type { AIQuestionRequest } from '@/features/ai-assistant/types';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
    },
  },
}));

describe('Phase 7: AI Assistant Service & Curriculum Engine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('generates a curriculum fallback calculation question when offline/unauthenticated', async () => {
    const req: AIQuestionRequest = {
      subject: 'الفيزياء',
      grade: 'الرابع العلمي',
      topic: 'الحركة والسرعة',
      questionType: 'calculation',
      difficulty: 'medium',
    };

    const res = await generateAIQuestion(req);

    expect(res.success).toBe(true);
    expect(res.usedFallback).toBe(true);
    expect(res.question).toBeDefined();
    expect(res.question?.type).toBe('calculation');
    expect(res.question?.prompt).toContain('الفيزياء');
    expect(res.question?.prompt).toContain('$');
    expect(res.question?.direction).toBe('rtl');
    expect(res.question?.marks).toBe(15);
  });

  it('generates an MCQ question with 4 options containing mathematical notation', async () => {
    const req: AIQuestionRequest = {
      subject: 'الفيزياء',
      grade: 'الخامس العلمي',
      questionType: 'mcq',
      difficulty: 'easy',
    };

    const res = await generateAIQuestion(req);

    expect(res.success).toBe(true);
    expect(res.question?.type).toBe('mcq');
    expect(res.question?.mcqOptions).toBeDefined();
    expect(res.question?.mcqOptions?.length).toBe(4);
    expect(res.question?.mcqOptions?.[0].text).toContain('$E_k');
  });

  it('generates a multi-part question with branches and balanced marks', async () => {
    const req: AIQuestionRequest = {
      subject: 'الرياضيات',
      grade: 'السادس العلمي',
      topic: 'التكامل وتطبيقاته',
      questionType: 'multi_part',
      difficulty: 'hard',
    };

    const res = await generateAIQuestion(req);

    expect(res.success).toBe(true);
    expect(res.question?.type).toBe('multi_part');
    expect(res.question?.marks).toBe(25);
    expect(res.question?.parts).toBeDefined();
    expect(res.question?.parts?.length).toBe(2);
    expect(res.question?.parts?.[0].letter).toBe('أ');
    expect(res.question?.parts?.[1].letter).toBe('ب');
  });

  it('generates true/false statements with scientific justifications', async () => {
    const req: AIQuestionRequest = {
      subject: 'الكيمياء',
      grade: 'الثالث المتوسط',
      questionType: 'true_false',
      difficulty: 'medium',
    };

    const res = await generateAIQuestion(req);

    expect(res.success).toBe(true);
    expect(res.question?.type).toBe('true_false');
    expect(res.question?.tfStatements).toBeDefined();
    expect(res.question?.tfStatements?.length).toBe(3);
    expect(res.question?.tfStatements?.[0].marks).toBe(5);
  });
});
