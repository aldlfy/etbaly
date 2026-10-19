import type { ExamHeaderData } from '../types';
import { GradingGrid } from './GradingGrid';
import { formatDigits } from '@/lib/arabic-numbers';

interface ExamFooterProps {
  data: ExamHeaderData;
  currentPage?: number;
  totalPages?: number;
  digitStyle?: 'eastern' | 'western';
  className?: string;
}

export function ExamFooter({
  data,
  currentPage = 1,
  totalPages = 1,
  digitStyle = 'eastern',
  className = '',
}: ExamFooterProps) {
  const currentFormatted = formatDigits(currentPage, digitStyle);
  const totalFormatted = formatDigits(totalPages, digitStyle);

  return (
    <div className={`exam-footer-container w-full mt-6 pt-3 text-black text-xs ${className}`}>
      {/* If grading grid is placed in footer */}
      {data.showGradingGrid && data.gradingGridPosition === 'footer' && (
        <div className="mb-4">
          <GradingGrid headerData={data} digitStyle={digitStyle} />
        </div>
      )}

      {/* Decorative separator line */}
      <div className="border-t-2 border-black mb-3"></div>

      <div className="flex flex-wrap items-center justify-between gap-2 font-bold px-2">
        {/* Good luck message */}
        <div className="text-sm italic text-slate-800 print:text-black">
          {data.goodLuckMessage || 'مع تمنياتنا لكم بالنجاح والتوفيق'}
        </div>

        {/* Teacher name */}
        {data.teacherName && (
          <div className="text-xs">
            <span>مدرس المادة: </span>
            <span className="underline decoration-dotted">{data.teacherName}</span>
          </div>
        )}

        {/* Dynamic Page X of Y */}
        <div className="text-xs px-2 py-0.5 border border-black/40 rounded bg-slate-50 print:bg-transparent">
          صفحة {currentFormatted} من {totalFormatted}
        </div>
      </div>
    </div>
  );
}
