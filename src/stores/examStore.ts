import { create } from 'zustand';
import type { ExamHeaderData } from '@/features/exam-header/types';
import { DEFAULT_EXAM_HEADER } from '@/features/exam-header/types';
import { db } from '@/db';

interface ExamState {
  examId: string;
  headerData: ExamHeaderData;
  isSaving: boolean;
  lastSavedAt: number | null;

  // Actions
  updateHeaderData: (updated: Partial<ExamHeaderData>) => void;
  loadDefaultSchoolProfile: () => Promise<void>;
  saveExamToDatabase: () => Promise<void>;
  resetToDefault: () => void;
}

export const useExamStore = create<ExamState>((set, get) => ({
  examId: 'exam-' + Date.now(),
  headerData: DEFAULT_EXAM_HEADER,
  isSaving: false,
  lastSavedAt: null,

  updateHeaderData: (updated) => {
    set((state) => ({
      headerData: { ...state.headerData, ...updated },
    }));
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
    const { examId, headerData } = get();
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
        questionIds: [],
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
