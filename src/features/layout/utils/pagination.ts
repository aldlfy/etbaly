import type { QuestionData } from '@/features/questions/types';
import type { ExamHeaderData } from '@/features/exam-header/types';
import type { ExamPageSettings, PageChunk, PageSize, PageOrientation } from '../types';

export interface PaperDimensions {
  widthMm: number;
  heightMm: number;
}

export function getPaperDimensions(size: PageSize, orientation: PageOrientation): PaperDimensions {
  let width = 210;
  let height = 297;

  switch (size) {
    case 'A3':
      width = 297;
      height = 420;
      break;
    case 'Letter':
      width = 215.9;
      height = 279.4;
      break;
    case 'A4':
    default:
      width = 210;
      height = 297;
      break;
  }

  if (orientation === 'landscape') {
    return { widthMm: height, heightMm: width };
  }

  return { widthMm: width, heightMm: height };
}

/**
 * Estimate the vertical height of a question in millimeters
 */
export function estimateQuestionHeightMm(q: QuestionData, settings: ExamPageSettings): number {
  const scale = settings.fontSizePt / 12;
  const lineFactor = settings.lineSpacing / 1.4;

  // Base prompt height (~15mm for short prompt, more for long prompts)
  const promptLines = Math.max(1, Math.ceil(q.prompt.length / 75));
  let height = (14 + promptLines * 6.5) * scale * lineFactor;

  switch (q.type) {
    case 'multi_part':
      if (q.parts && q.parts.length > 0) {
        q.parts.forEach((p) => {
          const partLines = Math.max(1, Math.ceil(p.content.length / 70));
          height += (10 + partLines * 6) * scale * lineFactor;
        });
      }
      break;

    case 'mcq':
      if (q.mcqLayout === 'vertical') {
        height += (q.mcqOptions?.length || 4) * 8 * scale;
      } else {
        height += 12 * scale; // single horizontal row
      }
      break;

    case 'true_false':
      height += (q.tfStatements?.length || 3) * 9 * scale;
      break;

    case 'matching':
      height += (q.matchingPairs?.length || 3) * 11 * scale;
      break;

    case 'calculation':
      if (q.answerSpaceType === 'dotted_lines') {
        height += (q.answerSpaceLines || 5) * 8.5;
      } else if (q.answerSpaceType === 'grid_box') {
        height += 38;
      } else {
        height += 24; // blank space
      }
      break;

    case 'fill_blank':
      height += 12 * scale;
      break;

    case 'essay':
    default:
      height += 10 * scale;
      break;
  }

  // Margin/padding between questions
  height += 6;

  // If 2 columns, questions take about half the visual height footprint on the page
  if (settings.columns === 2) {
    height = height * 0.58;
  }

  return height;
}

/**
 * Estimate header height in mm
 */
export function estimateHeaderHeightMm(header: ExamHeaderData): number {
  let h = 42; // Base Iraqi ministerial header
  if (header.instructions && header.instructions.trim().length > 0) {
    h += 12;
  }
  if (header.showGradingGrid && header.gradingGridPosition === 'header') {
    h += 22;
  }
  return h;
}

/**
 * Paginate questions into distinct pages based on heights, margins, and manual breaks
 */
export function paginateQuestions(
  questions: QuestionData[],
  header: ExamHeaderData,
  settings: ExamPageSettings
): PageChunk[] {
  if (questions.length === 0) {
    return [
      {
        pageNumber: 1,
        totalPages: 1,
        isFirstPage: true,
        isLastPage: true,
        questionIds: [],
      },
    ];
  }

  const { heightMm: pageHeight } = getPaperDimensions(settings.pageSize, settings.orientation);
  const printableHeight = pageHeight - settings.margins.top - settings.margins.bottom;

  const headerHeight = estimateHeaderHeightMm(header);
  const miniHeaderHeight = settings.repeatMiniHeaderOnSubsequentPages ? 16 : 0;
  const footerHeight = 14;

  const page1Capacity = printableHeight - headerHeight - footerHeight;
  const subsequentCapacity = printableHeight - miniHeaderHeight - footerHeight;

  const pages: string[][] = [[]];
  let currentCapacity = page1Capacity;
  let currentUsedHeight = 0;

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const qHeight = estimateQuestionHeightMm(q, settings);

    // If manual page break before this question and page is not empty
    if (q.pageBreakBefore && pages[pages.length - 1].length > 0) {
      pages.push([q.id]);
      currentCapacity = subsequentCapacity;
      currentUsedHeight = qHeight;
      continue;
    }

    // Check if adding this question exceeds current page capacity
    if (currentUsedHeight + qHeight > currentCapacity && pages[pages.length - 1].length > 0) {
      pages.push([q.id]);
      currentCapacity = subsequentCapacity;
      currentUsedHeight = qHeight;
    } else {
      pages[pages.length - 1].push(q.id);
      currentUsedHeight += qHeight;
    }
  }

  const totalPages = pages.length;

  return pages.map((qIds, idx) => ({
    pageNumber: idx + 1,
    totalPages,
    isFirstPage: idx === 0,
    isLastPage: idx === totalPages - 1,
    questionIds: qIds,
  }));
}

export interface FitOptimizationResult {
  targetPages: 1 | 2;
  recommendedSettings: Partial<ExamPageSettings>;
  canFit: boolean;
  message: string;
}

/**
 * Calculate recommended layout settings to fit questions into target number of pages
 */
export function calculateFitOptimizer(
  questions: QuestionData[],
  header: ExamHeaderData,
  currentSettings: ExamPageSettings,
  targetPages: 1 | 2
): FitOptimizationResult {
  const currentChunks = paginateQuestions(questions, header, currentSettings);
  if (currentChunks.length <= targetPages) {
    return {
      targetPages,
      recommendedSettings: {},
      canFit: true,
      message: `الامتحان يتسع بالفعل في ${currentChunks.length} صفحة.`,
    };
  }

  // Try progressive adjustments
  if (targetPages === 1) {
    const candidateSettings: ExamPageSettings = {
      ...currentSettings,
      fontSizePt: 11,
      lineSpacing: 1.2,
      marginPreset: 'narrow',
      margins: { top: 8, right: 8, bottom: 8, left: 8 },
      columns: questions.length >= 4 ? 2 : 1,
    };

    const testChunks = paginateQuestions(questions, header, candidateSettings);
    if (testChunks.length === 1) {
      return {
        targetPages: 1,
        recommendedSettings: candidateSettings,
        canFit: true,
        message: 'تم احتساب إعدادات مدمجة (هوامش 8مم، خط 11pt، تباعد 1.2) للملاءمة في صفحة واحدة.',
      };
    }

    // Try even tighter
    const ultraCompactSettings: ExamPageSettings = {
      ...candidateSettings,
      fontSizePt: 10,
      lineSpacing: 1.15,
      columns: 2,
    };
    const ultraChunks = paginateQuestions(questions, header, ultraCompactSettings);
    return {
      targetPages: 1,
      recommendedSettings: ultraCompactSettings,
      canFit: ultraChunks.length === 1,
      message: ultraChunks.length === 1
        ? 'تم ضبط الإعدادات إلى وضع مكثف جداً للملاءمة في صفحة واحدة.'
        : 'عدد الأسئلة كبير جداً للملاءمة في صفحة واحدة دون حذف بعض الفروع أو تقليل مساحات الحل.',
    };
  }

  // Target 2 pages
  const candidateSettings2: ExamPageSettings = {
    ...currentSettings,
    fontSizePt: 11.5,
    lineSpacing: 1.3,
    marginPreset: 'standard',
    margins: { top: 10, right: 10, bottom: 10, left: 10 },
  };

  const testChunks2 = paginateQuestions(questions, header, candidateSettings2);
  return {
    targetPages: 2,
    recommendedSettings: candidateSettings2,
    canFit: testChunks2.length <= 2,
    message: testChunks2.length <= 2
      ? 'تم احتساب الإعدادات للملاءمة النموذجية في صفحتين متوازنتين.'
      : 'تم تقليص الحجم لكن المحتوى قد يتطلب 3 صفحات.',
  };
}
