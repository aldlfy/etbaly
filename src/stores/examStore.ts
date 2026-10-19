import { create } from 'zustand';
import type { ExamHeaderData } from '@/features/exam-header/types';
import { DEFAULT_EXAM_HEADER } from '@/features/exam-header/types';
import type { QuestionData } from '@/features/questions/types';
import { db } from '@/db';

interface ExamState {
  examId: string;
  headerData: ExamHeaderData;
  questions: QuestionData[];
  isSaving: boolean;
  lastSavedAt: number | null;

  // Actions
  updateHeaderData: (updated: Partial<ExamHeaderData>) => void;
  setQuestions: (questions: QuestionData[]) => void;
  addQuestion: (question: QuestionData) => void;
  removeQuestion: (id: string) => void;
  updateQuestion: (id: string, updated: Partial<QuestionData>) => void;
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
      type: 'multi_part',
      prompt: 'أجب عن الفرعين الآتيين:',
      marks: 20,
      direction: 'rtl',
      isCollapsed: false,
      parts: [
        {
          id: 'p1',
          letter: 'أ',
          content: 'جد مجموعة حل المعادلة التربيعية في $\\mathbb{R}$: $2x^2 - 4x - 6 = 0$ باستخدام الدستور.',
          marks: 10,
        },
        {
          id: 'p2',
          letter: 'ب',
          content: 'احسب الغاية الآتية: $\\lim_{x \\to 0} \\frac{\\sin(5x)}{\\tan(2x)}$ مع بيان خطوات الحل.',
          marks: 10,
        },
      ],
    },
    {
      id: 'default-q2',
      type: 'calculation',
      prompt: 'تؤثر قوة أفقية $\\vec{F} = 40\\text{ N}$ في جسم كتلته $m = 8\\text{ kg}$ موضوع على سطح أملس. احسب تسارع الجسم $\\vec{a}$ بوحدة $\\text{m/s}^2$ والشغل المنجز $W$ خلال إزاحة $d = 5\\text{ m}$:',
      marks: 20,
      direction: 'rtl',
      isCollapsed: false,
      answerSpaceType: 'dotted_lines',
      answerSpaceLines: 5,
    },
    {
      id: 'default-q3',
      type: 'mcq',
      prompt: 'اختر الإجابة الصحيحة من بين الأقواس لما يأتي:',
      marks: 20,
      direction: 'rtl',
      isCollapsed: false,
      mcqLayout: 'horizontal',
      mcqOptions: [
        { id: 'opt1', letter: 'أ', text: '$R_{\\text{eq}} = R_1 + R_2$' },
        { id: 'opt2', letter: 'ب', text: '$\\frac{1}{R_{\\text{eq}}} = \\frac{1}{R_1} + \\frac{1}{R_2}$' },
        { id: 'opt3', letter: 'ج', text: '$R_{\\text{eq}} = R_1 \\cdot R_2$' },
        { id: 'opt4', letter: 'د', text: '$R_{\\text{eq}} = \\sqrt{R_1^2 + R_2^2}$' },
      ],
    },
  ],
  isSaving: false,
  lastSavedAt: null,

  updateHeaderData: (updated) => {
    set((state) => ({
      headerData: { ...state.headerData, ...updated },
    }));
  },

  setQuestions: (questions) => {
    set({ questions });
  },

  addQuestion: (q) => {
    set((state) => ({
      questions: [...state.questions, q],
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
