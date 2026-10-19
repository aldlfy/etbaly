export interface SchoolProfile {
  id: string;
  ministry: string;             // e.g. "جمهورية العراق - وزارة التربية"
  directorate: string;          // e.g. "المديرية العامة للتربية في محافظة بغداد / الرصافة الأولى"
  schoolName: string;           // e.g. "ثانوية المتميزين للبنين"
  logoBlobId?: string;          // reference to AssetBlob
  logoPlacement: 'right' | 'left' | 'center';
  createdAt: number;
  updatedAt: number;
}

export interface AssetBlob {
  id: string;
  name: string;
  mimeType: string;
  data: Blob;
  createdAt: number;
}

export interface ExamMetadata {
  subject: string;              // e.g. "الرياضيات"
  grade: string;                // e.g. "الرابع العلمي"
  section?: string;             // e.g. "أ / ب"
  examType: 'monthly_1' | 'monthly_2' | 'midyear' | 'final_round_1' | 'final_round_2' | 'mock';
  academicYear: string;         // e.g. "2025 - 2026"
  semester: string;             // e.g. "الكورس الأول" / "الفصل الدراسي الأول"
  date: string;
  duration: string;             // e.g. "ساعتان"
  totalMarks: number;           // e.g. 100
  instructions: string[];
  showGradingGrid: boolean;
  gradingGridPosition: 'header' | 'footer';
  teacherName?: string;
  reviewerName?: string;
  goodLuckMessage?: string;     // e.g. "مع تمنياتنا لكم بالنجاح والتفوق"
}

export interface ExamPageSettings {
  pageSize: 'A4' | 'A3' | 'Letter';
  orientation: 'portrait' | 'landscape';
  margins: { top: number; right: number; bottom: number; left: number };
  columns: 1 | 2;
  baseFont: 'cairo' | 'amiri' | 'tajawal' | 'noto';
  fontSizePt: number;
  lineSpacing: number;
  digitStyle: 'eastern' | 'western';
}

export interface Exam {
  id: string;
  title: string;
  metadata: ExamMetadata;
  pageSettings: ExamPageSettings;
  schoolProfileId?: string;
  questionIds: string[];
  createdAt: number;
  updatedAt: number;
}

export interface QuestionBankItem {
  id: string;
  subject: string;
  grade: string;
  chapter?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  type: string;
  content: string; // Tiptap JSON or HTML
  marks: number;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}
