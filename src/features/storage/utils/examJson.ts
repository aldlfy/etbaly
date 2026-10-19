import type { QuestionData } from '@/features/questions/types';
import type { ExamHeaderData } from '@/features/exam-header/types';
import type { ExamPageSettings } from '@/features/layout/types';

export interface ExamExportFormat {
  version: 1;
  generator: 'ExamForge';
  exportedAt: number;
  exam: {
    id: string;
    title: string;
    metadata: ExamHeaderData;
    pageSettings: ExamPageSettings;
    questions: QuestionData[];
  };
}

export function exportExamToJson(
  id: string,
  title: string,
  metadata: ExamHeaderData,
  pageSettings: ExamPageSettings,
  questions: QuestionData[]
): string {
  const exportData: ExamExportFormat = {
    version: 1,
    generator: 'ExamForge',
    exportedAt: Date.now(),
    exam: {
      id,
      title,
      metadata,
      pageSettings,
      questions,
    },
  };

  return JSON.stringify(exportData, null, 2);
}

export function importExamFromJson(jsonString: string): {
  id: string;
  title: string;
  metadata: ExamHeaderData;
  pageSettings: ExamPageSettings;
  questions: QuestionData[];
} {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('الملف ليس بصيغة JSON صالحة.');
    }

    const exam = parsed.exam || parsed;
    if (!exam.questions || !Array.isArray(exam.questions)) {
      throw new Error('الملف لا يحتوي على مصفوفة أسئلة صحيحة.');
    }

    return {
      id: exam.id || 'exam-' + Date.now(),
      title: exam.title || 'اختبار مستورد',
      metadata: exam.metadata || {},
      pageSettings: exam.pageSettings || {},
      questions: exam.questions,
    };
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(`فشل استيراد الاختبار: ${err.message}`);
    }
    throw new Error('فشل استيراد الاختبار: خطأ في بنية الملف.');
  }
}

export function triggerDownload(content: string, filename: string, mimeType = 'application/json') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
