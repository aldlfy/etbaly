import { create } from 'zustand';
import type { ExamHeaderData } from '@/features/exam-header/types';
import { DEFAULT_EXAM_HEADER } from '@/features/exam-header/types';
import type { QuestionData } from '@/features/questions/types';
import type { ExamPageSettings } from '@/features/layout/types';
import { DEFAULT_PAGE_SETTINGS } from '@/features/layout/types';
import { db } from '@/db';
import type { Exam } from '@/db/models';

interface ExamState {
  examId: string;
  headerData: ExamHeaderData;
  questions: QuestionData[];
  pageSettings: ExamPageSettings;
  isSaving: boolean;
  lastSavedAt: number | null;
  activeVariant: 'original' | 'model_a' | 'model_b';

  // Actions
  updateHeaderData: (updated: Partial<ExamHeaderData>) => void;
  updatePageSettings: (updated: Partial<ExamPageSettings>) => void;
  setActiveVariant: (variant: 'original' | 'model_a' | 'model_b') => void;
  loadExamFromRecord: (exam: Exam) => void;
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
  pageSettings: DEFAULT_PAGE_SETTINGS,
  isSaving: false,
  lastSavedAt: null,
  activeVariant: 'original',

  updateHeaderData: (updated) => {
    set((state) => ({
      headerData: { ...state.headerData, ...updated },
    }));
  },

  updatePageSettings: (updated) => {
    set((state) => ({
      pageSettings: { ...state.pageSettings, ...updated },
    }));
  },

  setActiveVariant: (activeVariant) => {
    set({ activeVariant });
  },

  loadExamFromRecord: (exam) => {
    set({
      examId: exam.id,
      headerData: {
        ...DEFAULT_EXAM_HEADER,
        ...(exam.metadata || {}),
        instructions: Array.isArray(exam.metadata?.instructions)
          ? exam.metadata.instructions[0] || ''
          : exam.metadata?.instructions || '',
      },
      pageSettings: {
        ...DEFAULT_PAGE_SETTINGS,
        ...(exam.pageSettings || {}),
      },
      questions: exam.questions || [],
      lastSavedAt: exam.updatedAt || exam.createdAt || Date.now(),
      activeVariant: 'original',
    });
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
          pageSize: get().pageSettings.pageSize,
          orientation: get().pageSettings.orientation,
          margins: get().pageSettings.margins,
          columns: get().pageSettings.columns,
          baseFont: get().pageSettings.baseFont,
          fontSizePt: get().pageSettings.fontSizePt,
          lineSpacing: get().pageSettings.lineSpacing,
          digitStyle: get().pageSettings.digitStyle,
        },
        questionIds: questions.map((q) => q.id),
        questions,
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
      pageSettings: DEFAULT_PAGE_SETTINGS,
      lastSavedAt: null,
    });
  },
}));
