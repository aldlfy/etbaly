import React, { useState } from 'react';
import type { QuestionData } from '@/features/questions/types';
import type { ExamHeaderData } from '@/features/exam-header/types';
import type { ExamPageSettings } from '../types';
import { paginateQuestions, getPaperDimensions } from '../utils/pagination';
import { ExamHeaderPreview } from '@/features/exam-header/components/ExamHeaderPreview';
import { GradingGrid } from '@/features/exam-header/components/GradingGrid';
import { ExamFooter } from '@/features/exam-header/components/ExamFooter';
import { QuestionPaperItem } from '@/features/questions/components/QuestionPaperItem';
import { MiniHeader } from './MiniHeader';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface MultiPageExamPreviewProps {
  questions: QuestionData[];
  header: ExamHeaderData;
  settings: ExamPageSettings;
}

export const MultiPageExamPreview: React.FC<MultiPageExamPreviewProps> = ({
  questions,
  header,
  settings,
}) => {
  const [zoom, setZoom] = useState<number>(100);

  const pages = paginateQuestions(questions, header, settings);
  const { widthMm, heightMm } = getPaperDimensions(settings.pageSize, settings.orientation);

  const questionsMap = new Map(questions.map((q) => [q.id, q]));

  // Base font class
  const fontClass = `font-${settings.baseFont}`;

  return (
    <div className="multi-page-preview flex flex-col items-center gap-8 w-full">
      {/* Zoom / View toolbar (no-print) */}
      <div className="no-print flex items-center justify-between w-full max-w-4xl px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300">
        <div className="flex items-center gap-2">
          <span>معاينة الطباعة ({pages.length} صفحة)</span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-500 font-normal">
            {settings.pageSize} ({settings.orientation === 'portrait' ? 'عمودي' : 'أفقي'}) • {settings.columns === 1 ? 'عمود واحد' : 'عمودان'}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setZoom((z) => Math.max(50, z - 10))}
            className="p-1 h-7 w-7"
            title="تصغير المعاينة"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </Button>

          <span className="min-w-10 text-center font-bold text-xs">{zoom}%</span>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setZoom((z) => Math.min(150, z + 10))}
            className="p-1 h-7 w-7"
            title="تكبير المعاينة"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setZoom(100)}
            className="p-1 h-7 w-7"
            title="إعادة ضبط الحجم 100%"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Pages Container */}
      <div
        className="pages-viewport flex flex-col items-center gap-8 w-full transition-transform origin-top"
        style={{ transform: `scale(${zoom / 100})` }}
      >
        {pages.map((chunk) => {
          const pageQuestions = chunk.questionIds
            .map((id) => questionsMap.get(id))
            .filter((q): q is QuestionData => Boolean(q));

          return (
            <div
              key={chunk.pageNumber}
              className="flex flex-col items-center w-full"
            >
              {/* Page Number Label (Screen only) */}
              <div className="no-print mb-2 text-xs font-bold text-slate-500 flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                  الصفحة {chunk.pageNumber} من {chunk.totalPages}
                </span>
                {chunk.isFirstPage && (
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    (الترويسة الرسمية كاملة)
                  </span>
                )}
              </div>

              {/* A4 Sheet Container */}
              <div
                className={`exam-page bg-white text-black shadow-2xl border border-slate-300 dark:border-slate-700 relative flex flex-col justify-between ${fontClass}`}
                style={{
                  width: `${widthMm}mm`,
                  minHeight: `${heightMm}mm`,
                  paddingTop: `${settings.margins.top}mm`,
                  paddingRight: `${settings.margins.right}mm`,
                  paddingBottom: `${settings.margins.bottom}mm`,
                  paddingLeft: `${settings.margins.left}mm`,
                  fontSize: `${settings.fontSizePt}pt`,
                  lineHeight: `${settings.lineSpacing}`,
                  boxSizing: 'border-box',
                }}
              >
                {/* Content top area */}
                <div className="flex-1 flex flex-col">
                  {/* Page 1: Full Header & optional grading grid */}
                  {chunk.isFirstPage ? (
                    <div className="mb-4">
                      <ExamHeaderPreview
                        data={header}
                        digitStyle={settings.digitStyle}
                      />
                      {header.showGradingGrid && header.gradingGridPosition === 'header' && (
                        <div className="mt-3">
                          <GradingGrid
                            headerData={header}
                            digitStyle={settings.digitStyle}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Page 2+: Ministerial Mini Header */
                    settings.repeatMiniHeaderOnSubsequentPages && (
                      <MiniHeader
                        header={header}
                        pageNumber={chunk.pageNumber}
                        totalPages={chunk.totalPages}
                        digitStyle={settings.digitStyle}
                      />
                    )
                  )}

                  {/* Questions Section (Single column or Two columns) */}
                  <div
                    className={`questions-column-container flex-1 ${
                      settings.columns === 2
                        ? 'columns-2 gap-6'
                        : 'flex flex-col gap-4'
                    }`}
                    style={
                      settings.columns === 2
                        ? {
                            columnRule: settings.columnRule
                              ? '1px solid #000000'
                              : 'none',
                          }
                        : undefined
                    }
                  >
                    {pageQuestions.map((q) => {
                      // Calculate overall question index in original questions array
                      const overallIndex = questions.findIndex((item) => item.id === q.id);
                      return (
                        <div
                          key={q.id}
                          className="question-block mb-4 break-inside-avoid"
                          style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}
                        >
                          <QuestionPaperItem
                            question={q}
                            index={overallIndex >= 0 ? overallIndex : 0}
                            digitStyle={settings.digitStyle}
                          />
                        </div>
                      );
                    })}

                    {pageQuestions.length === 0 && (
                      <div className="text-center py-12 text-slate-400 italic text-sm">
                        لا توجد أسئلة في هذه الصفحة
                      </div>
                    )}
                  </div>
                </div>

                {/* Page Footer */}
                <div className="mt-auto pt-2">
                  <ExamFooter
                    data={header}
                    currentPage={chunk.pageNumber}
                    totalPages={chunk.totalPages}
                    digitStyle={settings.digitStyle}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
