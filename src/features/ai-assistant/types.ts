import type { QuestionType, QuestionData } from '@/features/questions/types';

export interface AIQuestionRequest {
  subject: string;
  grade: string;
  topic?: string;
  questionType: QuestionType;
  difficulty: 'easy' | 'medium' | 'hard';
  instructions?: string;
}

export interface AIQuestionResponse {
  success: boolean;
  question?: QuestionData;
  error?: string;
  usedFallback?: boolean;
}
