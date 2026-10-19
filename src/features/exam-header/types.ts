export type ExamType = 
  | 'monthly_1' 
  | 'monthly_2' 
  | 'midyear' 
  | 'final_round_1' 
  | 'final_round_2' 
  | 'mock';

export type GradingGridPosition = 'header' | 'footer' | 'none';

export type LogoPlacement = 'right' | 'left' | 'center';

export interface ExamHeaderData {
  // Institutional Information
  ministry: string;             // e.g. "جمهورية العراق - وزارة التربية"
  directorate: string;          // e.g. "المديرية العامة للتربية في بغداد / الكرخ الأولى"
  schoolName: string;           // e.g. "ثانوية المتميزين النموذجية للبنين"
  logoBlobId?: string;          // IndexedDB Asset Blob ID
  logoUrl?: string;             // Blob URL in runtime
  logoPlacement: LogoPlacement;

  // Academic Information
  subject: string;              // e.g. "الرياضيات"
  grade: string;                // e.g. "الرابع العلمي"
  section: string;              // e.g. "أ / ب"
  examType: ExamType;
  academicYear: string;         // e.g. "2025 - 2026"
  semester: string;             // e.g. "الكورس الأول"
  date: string;                 // e.g. "2026-01-20"
  duration: string;             // e.g. "ساعتان"
  totalMarks: number;           // e.g. 100

  // Student Fields
  showStudentName: boolean;
  showExamSeat: boolean;
  instructions: string;         // e.g. "ملاحظة: أجب عن خمسة أسئلة فقط، لكل سؤال 20 درجة."

  // Grading Grid
  showGradingGrid: boolean;
  gradingGridPosition: GradingGridPosition;
  questionCountForGrid: number; // e.g. 5 or 6 questions

  // Teacher & Reviewer details
  teacherName: string;
  reviewerName: string;
  goodLuckMessage: string;
}

export const DEFAULT_EXAM_HEADER: ExamHeaderData = {
  ministry: 'جمهورية العراق - وزارة التربية',
  directorate: 'المديرية العامة للتربية في محافظة بغداد / الكرخ الأولى',
  schoolName: 'ثانوية المتميزين النموذجية للبنين',
  logoPlacement: 'center',
  subject: 'الرياضيات',
  grade: 'الرابع العلمي',
  section: 'أ / ب',
  examType: 'midyear',
  academicYear: '2025 - 2026',
  semester: 'الفصل الدراسي الأول',
  date: '2026-01-25',
  duration: 'ساعتان',
  totalMarks: 100,
  showStudentName: true,
  showExamSeat: true,
  instructions: 'ملاحظة: الإجابة عن خمسة أسئلة فقط، ولكل سؤال (20) درجة متساوية.',
  showGradingGrid: true,
  gradingGridPosition: 'header',
  questionCountForGrid: 6,
  teacherName: 'أ. أحمد العراقي',
  reviewerName: 'أ. مصطفى الحسني',
  goodLuckMessage: 'مع تمنياتنا لجميع طلبتنا الأعزاء بالنجاح الباهر والتفوق',
};

export const EXAM_TYPE_LABELS: Record<ExamType, string> = {
  monthly_1: 'امتحان الشهر الأول',
  monthly_2: 'امتحان الشهر الثاني',
  midyear: 'امتحان نصف السنة',
  final_round_1: 'الامتحان النهائي - الدور الأول',
  final_round_2: 'الامتحان النهائي - الدور الثاني',
  mock: 'الامتحان الشامل التجريبي (الوزاري)',
};
