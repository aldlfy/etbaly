export type QuestionType = 
  | 'essay' 
  | 'multi_part' 
  | 'mcq' 
  | 'true_false' 
  | 'fill_blank' 
  | 'matching' 
  | 'calculation';

export interface MultiPartItem {
  id: string;
  letter: string;      // e.g. "أ", "ب", "ج" or "a", "b", "c"
  content: string;     // Text with math notation
  marks: number;
}

export interface MCQOption {
  id: string;
  letter: string;      // e.g. "أ", "ب", "ج", "د"
  text: string;        // Text / formula
}

export interface MatchingPair {
  id: string;
  leftItem: string;    // Column A item (1, 2, 3...)
  rightItem: string;   // Column B item (أ, ب, ج...)
}

export interface QuestionData {
  id: string;
  type: QuestionType;
  title?: string;
  prompt: string;      // Main question text
  marks: number;
  direction: 'rtl' | 'ltr';
  isCollapsed?: boolean;

  // Specific to Multi-part
  parts?: MultiPartItem[];

  // Specific to MCQ
  mcqOptions?: MCQOption[];
  mcqLayout?: 'horizontal' | 'vertical';

  // Specific to True/False
  tfStatements?: Array<{ id: string; text: string; marks: number }>;

  // Specific to Fill Blank
  blankText?: string;

  // Specific to Matching
  matchingPairs?: MatchingPair[];

  // Specific to Calculation
  answerSpaceType?: 'blank' | 'dotted_lines' | 'grid_box';
  answerSpaceLines?: number; // e.g. 4 to 12 lines

  // Page layout
  pageBreakBefore?: boolean;
}

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  essay: 'سؤال مقالي / شرح',
  multi_part: 'سؤال متعدد الفروع (أ، ب، ج)',
  mcq: 'اختيار من متعدد (MCQ)',
  true_false: 'صح أو خطأ',
  fill_blank: 'املأ الفراغات',
  matching: 'سؤال مطابقة (صل بين القائمتين)',
  calculation: 'مسألة حسابية مع مساحة حل',
};
