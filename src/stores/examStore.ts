import { create } from 'zustand';
import type { ExamHeaderData } from '@/features/exam-header/types';
import { DEFAULT_EXAM_HEADER } from '@/features/exam-header/types';
import { db } from '@/db';

export interface ExamQuestionItem {
  id: string;
  title: string;
  content: string;
  marks: number;
  direction: 'rtl' | 'ltr';
}

interface ExamState {
  examId: string;
  headerData: ExamHeaderData;
  questions: ExamQuestionItem[];
  isSaving: boolean;
  lastSavedAt: number | null;

  // Actions
  updateHeaderData: (updated: Partial<ExamHeaderData>) => void;
  addQuestion: (question: Omit<ExamQuestionItem, 'id'> & { id?: string }) => void;
  removeQuestion: (id: string) => void;
  updateQuestion: (id: string, updated: Partial<ExamQuestionItem>) => void;
  clearQuestions: () => void;
  loadDefaultSchoolProfile: () => Promise<void>;
  saveExamToDatabase: () => Promise<void>;
  resetToDefault: () => void;
}

export const useExamStore = create<ExamState>((set, get) => ({
  examId: 'exam-' + Date.now(),
  headerData: DEFAULT_EXAM_HEADER,
  questions: [
    {
      id: 'default-q1',
      title: 'السؤال الأول',
      content: `أجب عما يأتي:
<br/>(أ) جد مجموعة حل المعادلة في $\\mathbb{R}$: $\\frac{x^2 - 4}{x - 2} = 5$
<br/>(ب) احسب الغاية: $\\lim_{x \\to 0} \\frac{\\sin(3x)}{x}$`,
      marks: 20,
      direction: 'rtl',
    },
    {
      id: 'default-q2',
      title: 'السؤال الثاني',
      content: `تؤثر قوة أفقية $\\vec{F} = 50\\text{ N}$ في جسم كتلته $m = 10\\text{ kg}$ موضوع على سطح أفقي أملس.
<br/>1- احسب تسارع الجسم $\\vec{a}$ بوحدة $\\text{m/s}^2$ بتطبيق $\\vec{F} = m \\vec{a}$.
<br/>2- جد الشغل المنجز $W = F \\cdot d$ خلال إزاحة قدرها $d = 5\\text{ m}$.`,
      marks: 20,
      direction: 'rtl',
    },
  ],
  isSaving: false,
  lastSavedAt: null,

  updateHeaderData: (updated) => {
    set((state) => ({
      headerData: { ...state.headerData, ...updated },
    }));
  },

  addQuestion: (q) => {
    const newQuestion: ExamQuestionItem = {
      id: q.id || 'q-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      title: q.title,
      content: q.content,
      marks: q.marks || 10,
      direction: q.direction || 'rtl',
    };
    set((state) => ({
      questions: [...state.questions, newQuestion],
    }));
  },

  removeQuestion: (id) => {
    set((state) => ({
      questions: state.questions.filter((q) => q.id !== id),
    }));
  },

  updateQuestion: (id, updated) => {
    set((state) => ({
      questions: state.questions.map((q) => (q.id === id ? { ...q, ...updated } : q)),
    }));
  },

  clearQuestions: () => {
    set({ questions: [] });
  },

  loadDefaultSchoolProfile: async () => {
    try {
      const profiles = await db.schoolProfiles.toArray();
      if (profiles.length > 0) {
        const defaultProfile = profiles[0];
        let logoUrl: string | undefined;

        if (defaultProfile.logoBlobId) {
          const blobRecord = await db.assetBlobs.get(defaultProfile.logoBlobId);
          if (blobRecord) {
            logoUrl = URL.createObjectURL(blobRecord.data);
          }
        }

        set((state) => ({
          headerData: {
            ...state.headerData,
            ministry: defaultProfile.ministry,
            directorate: defaultProfile.directorate,
            schoolName: defaultProfile.schoolName,
            logoPlacement: defaultProfile.logoPlacement || 'center',
            logoBlobId: defaultProfile.logoBlobId,
            logoUrl,
          },
        }));
      }
    } catch (err) {
      console.warn('Failed to load default school profile:', err);
    }
  },

  saveExamToDatabase: async () => {
    const { examId, headerData, questions } = get();
    set({ isSaving: true });
    try {
      const examRecord = {
        id: examId,
        title: `${headerData.subject} - ${headerData.grade} (${headerData.examType})`,
        metadata: {
          subject: headerData.subject,
          grade: headerData.grade,
          section: headerData.section,
          examType: headerData.examType,
          academicYear: headerData.academicYear,
          semester: headerData.semester,
          date: headerData.date,
          duration: headerData.duration,
          totalMarks: headerData.totalMarks,
          instructions: [headerData.instructions],
          showGradingGrid: headerData.showGradingGrid,
          gradingGridPosition: (headerData.gradingGridPosition === 'footer' ? 'footer' : 'header') as 'header' | 'footer',
          teacherName: headerData.teacherName,
          reviewerName: headerData.reviewerName,
          goodLuckMessage: headerData.goodLuckMessage,
        },
        pageSettings: {
          pageSize: 'A4' as const,
          orientation: 'portrait' as const,
          margins: { top: 20, right: 20, bottom: 20, left: 20 },
          columns: 1 as const,
          baseFont: 'cairo' as const,
          fontSizePt: 12,
          lineSpacing: 1.5,
          digitStyle: 'eastern' as const,
        },
        questionIds: questions.map((q) => q.id),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      await db.exams.put(examRecord);
      set({ lastSavedAt: Date.now() });
    } catch (err) {
      console.error('Failed to save exam to Dexie DB:', err);
    } finally {
      set({ isSaving: false });
    }
  },

  resetToDefault: () => {
    set({
      examId: 'exam-' + Date.now(),
      headerData: DEFAULT_EXAM_HEADER,
      lastSavedAt: null,
    });
  },
}));
