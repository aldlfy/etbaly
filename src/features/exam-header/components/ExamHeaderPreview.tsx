import type { ExamHeaderData } from '../types';
import { EXAM_TYPE_LABELS } from '../types';
import { GradingGrid } from './GradingGrid';
import { formatDigits } from '@/lib/arabic-numbers';

interface ExamHeaderPreviewProps {
  data: ExamHeaderData;
  digitStyle?: 'eastern' | 'western';
  className?: string;
}

export function ExamHeaderPreview({ data, digitStyle = 'eastern', className = '' }: ExamHeaderPreviewProps) {
  const formattedMarks = formatDigits(data.totalMarks, digitStyle);
  const formattedYear = formatDigits(data.academicYear, digitStyle);
  const formattedDate = formatDigits(data.date, digitStyle);

  const renderLogo = () => {
    if (data.logoUrl) {
      return (
        <div className="flex justify-center items-center">
          <img
            src={data.logoUrl}
            alt="شعار المدرسة"
            className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-sm print:drop-shadow-none"
          />
        </div>
      );
    }
    // Default Iraqi Ministry of Education / Eagle stylized emblem
    return (
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-black/40 flex flex-col items-center justify-center p-1 text-center bg-slate-50/80 print:bg-transparent">
        <svg className="w-8 h-8 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
        <span className="text-[8px] font-bold mt-0.5 leading-none">وزارة التربية</span>
      </div>
    );
  };

  return (
    <div className={`exam-header-container bg-white text-black p-4 sm:p-6 border-2 border-black rounded-sm print:border-black print:p-0 print:border-2 ${className}`}>
      {/* 3-Column Ministerial Header */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 items-center text-center pb-3 border-b-2 border-black">
        {/* Right Section: Institutional Hierarchy */}
        <div className="text-end pe-2 space-y-0.5 text-xs sm:text-sm font-semibold leading-relaxed">
          {data.logoPlacement === 'right' && (
            <div className="mb-2 flex justify-start">{renderLogo()}</div>
          )}
          <p className="font-bold text-sm sm:text-base">{data.ministry}</p>
          <p className="text-xs sm:text-sm">{data.directorate}</p>
          <p className="font-extrabold text-xs sm:text-sm text-brand-900 print:text-black">
            {data.schoolName}
          </p>
        </div>

        {/* Center Section: Logo & Exam Title */}
        <div className="flex flex-col items-center justify-center space-y-1">
          {data.logoPlacement === 'center' && renderLogo()}
          <h2 className="font-extrabold text-sm sm:text-lg text-black underline decoration-1 underline-offset-4">
            {EXAM_TYPE_LABELS[data.examType]}
          </h2>
          <div className="text-xs font-bold text-slate-700 print:text-black">
            للعام الدراسي: {formattedYear}
          </div>
          <div className="inline-flex items-center gap-2 text-xs font-extrabold bg-slate-100 print:bg-transparent px-2 py-0.5 rounded border border-black/20 print:border-none">
            <span>المادة: {data.subject}</span>
            <span>•</span>
            <span>الصف: {data.grade}</span>
            {data.section && (
              <>
                <span>•</span>
                <span>الشعبة: ({data.section})</span>
              </>
            )}
          </div>
        </div>

        {/* Left Section: Time, Date & Marks */}
        <div className="text-start ps-2 space-y-1 text-xs sm:text-sm font-semibold">
          {data.logoPlacement === 'left' && (
            <div className="mb-2 flex justify-end">{renderLogo()}</div>
          )}
          <p>
            <span className="font-bold">التاريخ: </span>
            <span>{formattedDate}</span>
          </p>
          <p>
            <span className="font-bold">الوقت: </span>
            <span>{data.duration}</span>
          </p>
          <p>
            <span className="font-bold">الدرجة الكلية: </span>
            <span className="font-bold text-brand-800 print:text-black">
              ({formattedMarks}) درجة
            </span>
          </p>
          <p>
            <span className="font-bold">الفصل/الدور: </span>
            <span>{data.semester}</span>
          </p>
        </div>
      </div>

      {/* Student Fields Bar */}
      {(data.showStudentName || data.showExamSeat) && (
        <div className="flex flex-wrap items-center justify-between text-xs font-semibold py-2 px-1 border-b border-black gap-2">
          {data.showStudentName && (
            <div className="flex items-center gap-1.5 flex-1 min-w-[200px]">
              <span className="font-bold">اسم الطالب الرباعي:</span>
              <span className="border-b border-dotted border-black flex-1 h-4"></span>
            </div>
          )}
          {data.showExamSeat && (
            <div className="flex items-center gap-1.5 w-48">
              <span className="font-bold">الرقم / القاعة:</span>
              <span className="border-b border-dotted border-black flex-1 h-4"></span>
            </div>
          )}
        </div>
      )}

      {/* General Instructions Note */}
      {data.instructions && (
        <div className="py-1.5 px-2 bg-slate-50 print:bg-transparent text-xs font-bold text-slate-900 border-b border-black/30">
          <span className="text-brand-700 print:text-black">{data.instructions}</span>
        </div>
      )}

      {/* Grading Grid (If in Header position) */}
      {data.showGradingGrid && data.gradingGridPosition === 'header' && (
        <GradingGrid headerData={data} digitStyle={digitStyle} className="mt-2" />
      )}
    </div>
  );
}
