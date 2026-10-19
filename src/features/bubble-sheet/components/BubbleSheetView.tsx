import React from 'react';
import type { ExamHeaderData } from '@/features/exam-header/types';
import { formatDigits } from '@/lib/arabic-numbers';
import type { DigitStyle } from '@/features/layout/types';
import { Button } from '@/components/ui/Button';
import { Printer, CheckCircle2 } from 'lucide-react';

interface BubbleSheetViewProps {
  header: ExamHeaderData;
  questionCount?: number;
  digitStyle?: DigitStyle;
  variantLabel?: string;
}

export const BubbleSheetView: React.FC<BubbleSheetViewProps> = ({
  header,
  questionCount = 30,
  digitStyle = 'eastern',
  variantLabel = 'نموذج (أ)',
}) => {
  const handlePrint = () => {
    window.print();
  };

  // Build items array
  const totalItems = Math.max(20, Math.min(50, questionCount));
  const items = Array.from({ length: totalItems }, (_, i) => i + 1);

  // Split into 2 columns for A4 layout (up to 25 items per column)
  const midpoint = Math.ceil(totalItems / 2);
  const col1 = items.slice(0, midpoint);
  const col2 = items.slice(midpoint);

  const bubbleLetters = ['أ', 'ب', 'ج', 'د'];

  return (
    <div className="flex flex-col items-center w-full font-cairo">
      {/* Top action bar (no-print) */}
      <div className="no-print w-full max-w-4xl flex items-center justify-between mb-4 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-xs">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          <span className="font-extrabold text-slate-800 dark:text-slate-100">
            ورقة الإجابة التظليلية الرسمية (Bubble Sheet)
          </span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-500 font-bold">
            عدد الفقرات: {formatDigits(totalItems, digitStyle)} فقرة
          </span>
        </div>

        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={handlePrint}
          className="text-xs font-bold"
        >
          <Printer className="w-3.5 h-3.5 ml-1" />
          طباعة ورقة التظليل
        </Button>
      </div>

      {/* Printable Sheet */}
      <div
        className="print-area exam-page bg-white text-black p-8 sm:p-10 shadow-2xl border border-slate-300 w-full max-w-4xl min-h-[1123px] flex flex-col justify-between"
        style={{ boxSizing: 'border-box' }}
      >
        <div>
          {/* Header Box */}
          <div className="border-2 border-black p-4 mb-4 select-none">
            <div className="flex items-center justify-between text-xs font-bold border-b border-black pb-2 mb-2">
              <span>{header.ministry}</span>
              <span>{header.directorate}</span>
              <span>{header.schoolName}</span>
            </div>

            <div className="text-center my-1">
              <h1 className="text-base font-extrabold text-black">
                ورقة الإجابة التظليلية الموحدة (Bubble Sheet)
              </h1>
              <p className="text-xs font-bold text-slate-800 mt-0.5">
                امتحان: {header.subject} • {header.grade} • {header.academicYear}
              </p>
            </div>

            {/* Student Info Box */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-black text-xs font-bold">
              <div>
                <span>اسم الطالب: </span>
                <span className="underline decoration-dotted">................................</span>
              </div>
              <div>
                <span>الرقم الامتحاني: </span>
                <span className="underline decoration-dotted">................</span>
              </div>
              <div>
                <span>القاعة: </span>
                <span className="underline decoration-dotted">........</span>
              </div>
              <div className="text-left font-extrabold text-brand-700">
                <span>النموذج: </span>
                <span className="px-2 py-0.5 border border-black rounded">{variantLabel}</span>
              </div>
            </div>
          </div>

          {/* Instructions Box */}
          <div className="p-2.5 mb-4 border border-black bg-slate-50 text-[11px] font-bold text-slate-800 flex items-center justify-between">
            <span>
              تعليمات: استخدم قلماً جافاً (أزرق أو أسود) لتظليل الدائرة المختارة بالكامل ⬤ وتجنب استخدام القلم الرصاص أو المزيل.
            </span>
            <div className="flex items-center gap-2 shrink-0 mr-2">
              <span className="flex items-center gap-1">
                <span className="inline-block w-3.5 h-3.5 rounded-full bg-black text-white text-[9px] text-center leading-3">✓</span>
                صحيح
              </span>
              <span className="flex items-center gap-1 text-slate-500">
                <span className="inline-block w-3.5 h-3.5 rounded-full border border-black text-[9px] text-center leading-3">✗</span>
                خاطئ
              </span>
            </div>
          </div>

          {/* 2-Columns of Bubbles */}
          <div className="grid grid-cols-2 gap-8 border-2 border-black p-4">
            {/* Column 1 */}
            <div className="space-y-2 border-l border-black pl-4">
              {col1.map((num) => (
                <div
                  key={num}
                  className="flex items-center justify-between py-1 border-b border-dashed border-slate-300 text-xs"
                >
                  <span className="font-extrabold w-8 text-center bg-slate-100 rounded px-1">
                    {formatDigits(num, digitStyle)}
                  </span>
                  <div className="flex items-center gap-3">
                    {bubbleLetters.map((letter) => (
                      <div
                        key={letter}
                        className="flex flex-col items-center justify-center w-6 h-6 rounded-full border-2 border-black font-extrabold text-[11px] hover:bg-black hover:text-white cursor-pointer transition-colors"
                      >
                        {letter}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Column 2 */}
            <div className="space-y-2 pr-4">
              {col2.map((num) => (
                <div
                  key={num}
                  className="flex items-center justify-between py-1 border-b border-dashed border-slate-300 text-xs"
                >
                  <span className="font-extrabold w-8 text-center bg-slate-100 rounded px-1">
                    {formatDigits(num, digitStyle)}
                  </span>
                  <div className="flex items-center gap-3">
                    {bubbleLetters.map((letter) => (
                      <div
                        key={letter}
                        className="flex flex-col items-center justify-center w-6 h-6 rounded-full border-2 border-black font-extrabold text-[11px] hover:bg-black hover:text-white cursor-pointer transition-colors"
                      >
                        {letter}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer & Proctor signature */}
        <div className="mt-8 pt-4 border-t-2 border-black flex items-center justify-between text-xs font-bold px-4">
          <div>
            <span>توقيع المراقب: </span>
            <span className="underline decoration-dotted">................................</span>
          </div>

          <div className="text-center text-[11px] text-slate-500">
            ExamForge • منصة إعداد وتنسيق الاختبارات المدرسية
          </div>

          <div>
            <span>توقيع المدقق: </span>
            <span className="underline decoration-dotted">................................</span>
          </div>
        </div>
      </div>
    </div>
  );
};
