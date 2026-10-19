import type { ExamHeaderData } from '../types';
import { formatDigits } from '@/lib/arabic-numbers';

interface GradingGridProps {
  headerData: ExamHeaderData;
  digitStyle?: 'eastern' | 'western';
  className?: string;
}

export function GradingGrid({ headerData, digitStyle = 'eastern', className = '' }: GradingGridProps) {
  const count = Math.min(Math.max(headerData.questionCountForGrid || 6, 3), 10);
  const questions = Array.from({ length: count }, (_, i) => i + 1);

  return (
    <div className={`overflow-x-auto my-2 ${className}`}>
      <table className="w-full border-collapse border border-black text-center text-[11px] leading-tight text-black bg-white">
        <thead>
          <tr className="bg-slate-100 print:bg-transparent font-bold">
            <th className="border border-black px-2 py-1 w-24">رقم السؤال</th>
            {questions.map((q) => (
              <th key={q} className="border border-black px-1.5 py-1">
                س{formatDigits(q, digitStyle)}
              </th>
            ))}
            <th className="border border-black px-2 py-1 font-extrabold bg-slate-200/60 print:bg-transparent">
              المجموع
            </th>
            <th className="border border-black px-2 py-1 w-28">توقيع المصحح</th>
            <th className="border border-black px-2 py-1 w-28">توقيع المدقق</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-black px-2 py-1.5 font-semibold bg-slate-50 print:bg-transparent">
              الدرجة رقماً
            </td>
            {questions.map((q) => (
              <td key={q} className="border border-black h-7"></td>
            ))}
            <td className="border border-black h-7 bg-slate-100/50 print:bg-transparent"></td>
            <td rowSpan={2} className="border border-black text-slate-400 text-[10px] align-bottom pb-1">
              {headerData.teacherName || '..................'}
            </td>
            <td rowSpan={2} className="border border-black text-slate-400 text-[10px] align-bottom pb-1">
              {headerData.reviewerName || '..................'}
            </td>
          </tr>
          <tr>
            <td className="border border-black px-2 py-1.5 font-semibold bg-slate-50 print:bg-transparent">
              الدرجة كتابة
            </td>
            {questions.map((q) => (
              <td key={q} className="border border-black h-7"></td>
            ))}
            <td className="border border-black h-7 bg-slate-100/50 print:bg-transparent"></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
