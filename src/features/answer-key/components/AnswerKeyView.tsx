import React from 'react';
import type { QuestionData } from '@/features/questions/types';
import type { ExamHeaderData } from '@/features/exam-header/types';
import { formatDigits } from '@/lib/arabic-numbers';
import type { DigitStyle } from '@/features/layout/types';
import { Button } from '@/components/ui/Button';
import { Printer, CheckCircle } from 'lucide-react';
import { renderMathInText } from '@/lib/katex';

interface AnswerKeyViewProps {
  questions: QuestionData[];
  header: ExamHeaderData;
  digitStyle?: DigitStyle;
  variantLabel?: string;
}

export const AnswerKeyView: React.FC<AnswerKeyViewProps> = ({
  questions,
  header,
  digitStyle = 'eastern',
  variantLabel,
}) => {
  const totalMarks = questions.reduce((acc, q) => acc + (q.marks || 0), 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Print button bar (no-print) */}
      <div className="no-print w-full max-w-4xl flex items-center justify-between mb-4 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-xs">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="font-extrabold text-slate-800 dark:text-slate-100">
            نموذج الإجابة الرسمي وسلم توزيع الدرجات {variantLabel ? `(${variantLabel})` : ''}
          </span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-500 font-bold">
            مجموع الدرجات: {formatDigits(totalMarks, digitStyle)} درجة
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
          طباعة سلم التصحيح
        </Button>
      </div>

      {/* Printable Sheet */}
      <div
        className="print-area exam-page bg-white text-black p-8 sm:p-10 shadow-2xl border border-slate-300 w-full max-w-4xl min-h-[1123px] font-cairo flex flex-col justify-between"
        style={{ boxSizing: 'border-box' }}
      >
        <div>
          {/* Header */}
          <div className="border-2 border-black p-4 mb-6 text-center select-none">
            <div className="flex items-center justify-between text-xs font-bold border-b border-black pb-2 mb-2">
              <span>{header.ministry}</span>
              <span>{header.directorate}</span>
              <span>{header.schoolName}</span>
            </div>

            <h1 className="text-lg font-extrabold text-black tracking-wide my-1">
              نموذج الإجابة الرسمي ومخطط توزيع الدرجات {variantLabel ? `- ${variantLabel}` : ''}
            </h1>

            <div className="flex items-center justify-between text-xs font-bold pt-2 border-t border-black text-slate-800">
              <span>المادة: {header.subject}</span>
              <span>الصف: {header.grade}</span>
              <span>العام الدراسي: {header.academicYear}</span>
              <span>الدرجة الكلية: {formatDigits(totalMarks, digitStyle)} درجة</span>
            </div>
          </div>

          {/* Table of Questions & Marking Scheme */}
          <table className="w-full border-collapse border-2 border-black text-xs text-right">
            <thead>
              <tr className="bg-slate-100 print:bg-slate-200 border-b-2 border-black font-extrabold">
                <th className="p-2 border border-black w-14 text-center">رقم السؤال</th>
                <th className="p-2 border border-black">عناصر الإجابة النموذجية والخطوات المطلوبة</th>
                <th className="p-2 border border-black w-24 text-center">الدرجة المخصصة</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q, idx) => {
                const qNumStr = `س${formatDigits(idx + 1, digitStyle)}`;

                return (
                  <tr key={q.id} className="border-b border-black break-inside-avoid">
                    {/* Question number */}
                    <td className="p-3 border border-black text-center font-extrabold align-top bg-slate-50 print:bg-transparent">
                      {qNumStr}
                    </td>

                    {/* Model Answer Body */}
                    <td className="p-3 border border-black space-y-2 align-top">
                      {/* Question prompt summary */}
                      <div
                        className="font-bold text-slate-800 text-[11px] mb-1.5"
                        dangerouslySetInnerHTML={{ __html: renderMathInText(q.prompt) }}
                      />

                      {/* Detail by type */}
                      {q.type === 'multi_part' && q.parts && (
                        <div className="space-y-1.5 pr-2 border-r-2 border-slate-300">
                          {q.parts.map((p) => (
                            <div key={p.id} className="flex items-start justify-between gap-2">
                              <span>
                                <strong className="ml-1">فرع ({p.letter}):</strong> خطوات الحل الصحيحة وتطبيق القانون.
                              </span>
                              <span className="font-bold text-slate-700 shrink-0">
                                ({formatDigits(p.marks, digitStyle)} درجات)
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {q.type === 'mcq' && q.mcqOptions && (
                        <div className="text-slate-700">
                          <span>الإجابة الصحيحة: </span>
                          <strong className="underline decoration-double">
                            الخيار ({q.mcqOptions[0]?.letter || 'أ'})
                          </strong>
                          <span className="text-[11px] text-slate-500 mr-2">
                            (أو ما يطابق النص المحدد في المنهاج)
                          </span>
                        </div>
                      )}

                      {q.type === 'true_false' && q.tfStatements && (
                        <div className="space-y-1 pr-2 border-r-2 border-slate-300">
                          {q.tfStatements.map((st, sIdx) => (
                            <div key={st.id} className="flex items-center justify-between gap-2">
                              <span>
                                ({formatDigits(sIdx + 1, digitStyle)}) تحديد الصحة أو الخطأ مع تصحيح الخطأ إن وجد.
                              </span>
                              <span className="font-bold text-slate-700">
                                ({formatDigits(st.marks, digitStyle)} درجات)
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {q.type === 'calculation' && (
                        <div className="space-y-1 text-slate-700 pr-2 border-r-2 border-slate-300 text-[11px]">
                          <div>• كتابة القانون الرياضي المناسب: (درجتان)</div>
                          <div>• التعويض العددي الصحيح بالوحدات الدولية: (درجتان)</div>
                          <div>• الحساب الرياضي واستخراج الناتج النهائي مع وحدة القياس: (درجتان)</div>
                        </div>
                      )}

                      {q.type === 'essay' && (
                        <div className="text-slate-600 italic text-[11px]">
                          يُقبل أي تعبير علمي سليم يغطي المفاهيم الأساسية، وتوزع الدرجة على النقاط الجوهرية.
                        </div>
                      )}
                    </td>

                    {/* Total Marks for this question */}
                    <td className="p-3 border border-black text-center font-extrabold text-sm align-top">
                      {formatDigits(q.marks, digitStyle)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 print:bg-slate-200 border-t-2 border-black font-extrabold">
                <td colSpan={2} className="p-3 border border-black text-left pl-4 text-sm">
                  المجموع الكلي للدرجات:
                </td>
                <td className="p-3 border border-black text-center text-base font-extrabold text-black">
                  {formatDigits(totalMarks, digitStyle)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Footer Signatures */}
        <div className="mt-12 pt-4 border-t-2 border-black flex items-center justify-between text-xs font-bold px-4">
          <div>
            <span>مدرس المادة: </span>
            <span className="underline decoration-dotted">{header.teacherName || '..........................'}</span>
          </div>

          <div>
            <span>عضو لجنة التدقيق: </span>
            <span className="underline decoration-dotted">{header.reviewerName || '..........................'}</span>
          </div>

          <div>
            <span>مدير المدرسة: </span>
            <span className="underline decoration-dotted">..........................</span>
          </div>
        </div>
      </div>
    </div>
  );
};
