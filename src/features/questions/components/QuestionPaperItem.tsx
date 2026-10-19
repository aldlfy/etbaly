import type { QuestionData } from '../types';
import { renderLatex } from '@/lib/katex';
import { formatDigits } from '@/lib/arabic-numbers';
import { formatMarksLabel, getQuestionHeaderLabel } from '../utils/numbering';

interface QuestionPaperItemProps {
  question: QuestionData;
  index: number;
  digitStyle?: 'eastern' | 'western';
}

export function QuestionPaperItem({
  question,
  index,
  digitStyle = 'eastern',
}: QuestionPaperItemProps) {
  const parseMath = (html: string) => {
    if (!html) return '';
    return html.replace(/\$([^$]+)\$/g, (_, math) => {
      return renderLatex(math, { displayMode: false });
    });
  };

  const headerLabel = getQuestionHeaderLabel(index, digitStyle, 'compact');
  const marksLabel = formatMarksLabel(question.marks, digitStyle);

  return (
    <div
      dir={question.direction}
      className={`question-paper-block relative pb-4 border-b border-black/40 break-inside-avoid page-break-inside-avoid ${
        question.direction === 'ltr' ? 'text-left font-sans' : 'text-right font-cairo'
      }`}
    >
      {/* Question Header & Line-End Marks */}
      <div className="flex items-start justify-between font-bold text-sm mb-1.5 gap-4">
        <div className="flex items-center gap-1.5 flex-1">
          <span className="font-extrabold text-base min-w-[32px]">{headerLabel}:</span>
          <div
            className="leading-relaxed inline"
            dangerouslySetInnerHTML={{ __html: parseMath(question.prompt) }}
          />
        </div>
        <span className="text-xs font-bold shrink-0 text-black">
          {marksLabel}
        </span>
      </div>

      {/* 1. Multi-Part Questions (أ، ب، ج) */}
      {question.type === 'multi_part' && question.parts && question.parts.length > 0 && (
        <div className="space-y-2 mt-2 ps-6">
          {question.parts.map((part) => (
            <div key={part.id} className="flex items-start justify-between text-xs leading-relaxed gap-3">
              <div className="flex items-start gap-1.5 flex-1">
                <span className="font-extrabold shrink-0">({part.letter})</span>
                <div
                  className="inline"
                  dangerouslySetInnerHTML={{ __html: parseMath(part.content) }}
                />
              </div>
              <span className="font-semibold text-[11px] shrink-0 text-black">
                {formatMarksLabel(part.marks, digitStyle)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* 2. Multiple Choice Questions (MCQ) */}
      {question.type === 'mcq' && question.mcqOptions && question.mcqOptions.length > 0 && (
        <div
          className={`mt-2 ps-6 text-xs ${
            question.mcqLayout === 'vertical'
              ? 'space-y-1.5'
              : 'grid grid-cols-2 sm:grid-cols-4 gap-2'
          }`}
        >
          {question.mcqOptions.map((opt) => (
            <div key={opt.id} className="flex items-center gap-1.5">
              <span className="font-bold">({opt.letter})</span>
              <div
                className="inline"
                dangerouslySetInnerHTML={{ __html: parseMath(opt.text) }}
              />
            </div>
          ))}
        </div>
      )}

      {/* 3. True / False Questions */}
      {question.type === 'true_false' && question.tfStatements && (
        <div className="space-y-2 mt-2 ps-6 text-xs">
          {question.tfStatements.map((item, sIdx) => (
            <div key={item.id} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 flex-1">
                <span className="font-bold">({formatDigits(sIdx + 1, digitStyle)})</span>
                <span dangerouslySetInnerHTML={{ __html: parseMath(item.text) }} />
              </div>
              <span className="font-mono font-bold text-xs shrink-0 tracking-widest">
                (&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;)
              </span>
            </div>
          ))}
        </div>
      )}

      {/* 4. Fill in the Blank */}
      {question.type === 'fill_blank' && question.blankText && (
        <div className="mt-2 ps-6 text-xs leading-loose">
          <div dangerouslySetInnerHTML={{ __html: parseMath(question.blankText) }} />
        </div>
      )}

      {/* 5. Matching Columns */}
      {question.type === 'matching' && question.matchingPairs && (
        <div className="mt-3 ps-4 space-y-2 text-xs">
          <table className="w-full border border-black text-center text-xs">
            <thead>
              <tr className="bg-slate-100 print:bg-transparent font-bold">
                <th className="border border-black p-1.5 w-1/2">القائمة (أ)</th>
                <th className="border border-black p-1.5 w-1/2">القائمة (ب)</th>
              </tr>
            </thead>
            <tbody>
              {question.matchingPairs.map((pair, pIdx) => (
                <tr key={pair.id}>
                  <td className="border border-black p-1.5 text-start ps-3">
                    <span className="font-bold me-1.5">({formatDigits(pIdx + 1, digitStyle)})</span>
                    <span dangerouslySetInnerHTML={{ __html: parseMath(pair.leftItem) }} />
                  </td>
                  <td className="border border-black p-1.5 text-start ps-3">
                    <span className="font-bold me-1.5">({pair.rightItem.split('-')[0] || ''})</span>
                    <span dangerouslySetInnerHTML={{ __html: parseMath(pair.rightItem) }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-[11px] font-semibold text-slate-700 print:text-black pt-1">
            الإجابة: 1-( &nbsp; ) ، 2-( &nbsp; ) ، 3-( &nbsp; ) ، 4-( &nbsp; )
          </p>
        </div>
      )}

      {/* 6. Calculation with Reserved Space */}
      {question.type === 'calculation' && (
        <div className="mt-3 ps-2">
          {question.answerSpaceType === 'dotted_lines' && (
            <div className="space-y-4 my-2">
              {Array.from({ length: question.answerSpaceLines || 5 }).map((_, lIdx) => (
                <div
                  key={lIdx}
                  className="w-full border-b border-dotted border-black/50 h-5"
                />
              ))}
            </div>
          )}

          {question.answerSpaceType === 'grid_box' && (
            <div
              className="w-full border border-black rounded my-2 bg-slate-50/30 print:bg-transparent"
              style={{
                height: `${(question.answerSpaceLines || 6) * 22}px`,
                backgroundImage: 'radial-gradient(circle, #888 1px, transparent 1px)',
                backgroundSize: '16px 16px',
              }}
            >
              <span className="text-[9px] text-slate-400 p-1 block">مكان الحل والحسابات:</span>
            </div>
          )}

          {(!question.answerSpaceType || question.answerSpaceType === 'blank') && (
            <div style={{ height: `${(question.answerSpaceLines || 4) * 20}px` }} />
          )}
        </div>
      )}
    </div>
  );
}
