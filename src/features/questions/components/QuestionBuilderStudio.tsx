import type { QuestionData, QuestionType } from '../types';
import { QuestionCard } from './QuestionCard';
import { 
  computeTotalMarks, 
  moveQuestion, 
  duplicateQuestion 
} from '../utils/numbering';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatDigits } from '@/lib/arabic-numbers';
import { 
  ChevronsUpDown, 
  AlertTriangle, 
  CheckCircle2, 
  ListOrdered,
  FileQuestion,
  HelpCircle,
  Calculator,
  Shuffle
} from 'lucide-react';

interface QuestionBuilderStudioProps {
  questions: QuestionData[];
  targetTotalMarks: number;
  digitStyle?: 'eastern' | 'western';
  onQuestionsChange: (questions: QuestionData[]) => void;
}

export function QuestionBuilderStudio({
  questions,
  targetTotalMarks,
  digitStyle = 'eastern',
  onQuestionsChange,
}: QuestionBuilderStudioProps) {
  const currentTotal = computeTotalMarks(questions);
  const isMarksMismatch = currentTotal !== targetTotalMarks;

  const handleAddQuestion = (type: QuestionType) => {
    const id = 'q-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);

    let defaultQuestion: QuestionData = {
      id,
      type,
      prompt: 'اكتب نص السؤال هنا...',
      marks: 10,
      direction: 'rtl',
      isCollapsed: false,
    };

    if (type === 'multi_part') {
      defaultQuestion = {
        ...defaultQuestion,
        prompt: 'أجب عن الفروع الآتية:',
        marks: 20,
        parts: [
          { id: 'p1', letter: 'أ', content: 'عرّف ما يأتي باختصار...', marks: 10 },
          { id: 'p2', letter: 'ب', content: 'علل لما يأتي معززاً إجابتك بالمعادلة...', marks: 10 },
        ],
      };
    } else if (type === 'mcq') {
      defaultQuestion = {
        ...defaultQuestion,
        prompt: 'اختر الإجابة الصحيحة من بين الخيارات المعطاة:',
        marks: 10,
        mcqLayout: 'horizontal',
        mcqOptions: [
          { id: 'opt1', letter: 'أ', text: 'الخيار الأول' },
          { id: 'opt2', letter: 'ب', text: 'الخيار الثاني' },
          { id: 'opt3', letter: 'ج', text: 'الخيار الثالث' },
          { id: 'opt4', letter: 'د', text: 'الخيار الرابع' },
        ],
      };
    } else if (type === 'true_false') {
      defaultQuestion = {
        ...defaultQuestion,
        prompt: 'ضع كلمة (صح) أمام العبارة الصحيحة وكلمة (خطأ) أمام العبارة الخاطئة:',
        marks: 10,
        tfStatements: [
          { id: 'tf1', text: 'تكون سرعة الصوت في الجوامد أكبر منها في الغازات.', marks: 5 },
          { id: 'tf2', text: 'المقاومة الكهربائية تتناسب عكسياً مع طول السلك الموصل.', marks: 5 },
        ],
      };
    } else if (type === 'fill_blank') {
      defaultQuestion = {
        ...defaultQuestion,
        prompt: 'املأ الفراغات الآتية بما يناسبها علمياً:',
        marks: 10,
        blankText: '1- يسمى الجهاز المستخدم لقياس شدة التيار الكهربائي بـ ....................... بينما يقاس فرق الجهد بـ .......................',
      };
    } else if (type === 'matching') {
      defaultQuestion = {
        ...defaultQuestion,
        prompt: 'صل بين كل عنصر من القائمة (أ) بما يناسبه من القائمة (ب):',
        marks: 10,
        matchingPairs: [
          { id: 'm1', leftItem: 'قوة الجاذبية الأرضية', rightItem: 'أ- تقاس بوحدة النيوتن' },
          { id: 'm2', leftItem: 'القدرة الكهربائية', rightItem: 'ب- تقاس بوحدة الواط' },
          { id: 'm3', leftItem: 'سعة المتسعة', rightItem: 'ج- تقاس بوحدة الفاراد' },
        ],
      };
    } else if (type === 'calculation') {
      defaultQuestion = {
        ...defaultQuestion,
        prompt: 'احسب مقدار الطاقة الحركية لجسم كتلته $m = 4\\text{ kg}$ يتحرك بسرعة $v = 10\\text{ m/s}$ بتطبيق $K = \\frac{1}{2} m v^2$:',
        marks: 10,
        answerSpaceType: 'dotted_lines',
        answerSpaceLines: 6,
      };
    }

    onQuestionsChange([...questions, defaultQuestion]);
  };

  const handleUpdate = (index: number, updated: Partial<QuestionData>) => {
    const list = [...questions];
    list[index] = { ...list[index], ...updated };
    onQuestionsChange(list);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const target = questions[index];
    const updated = moveQuestion(questions, target.id, direction);
    onQuestionsChange(updated);
  };

  const handleDuplicate = (id: string) => {
    const updated = duplicateQuestion(questions, id);
    onQuestionsChange(updated);
  };

  const handleDelete = (id: string) => {
    onQuestionsChange(questions.filter((q) => q.id !== id));
  };

  const toggleAllCollapse = () => {
    const hasAnyOpen = questions.some((q) => !q.isCollapsed);
    onQuestionsChange(questions.map((q) => ({ ...q, isCollapsed: hasAnyOpen })));
  };

  return (
    <div className="space-y-4">
      {/* Top Banner: Quick Add Bar & Marks Alert */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              إضافة سؤال جديد بالنوع:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <Button size="sm" variant="outline" onClick={() => handleAddQuestion('essay')} className="text-xs py-1 px-2.5">
                <FileQuestion className="w-3.5 h-3.5 me-1 text-brand-500" />
                مقالي
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleAddQuestion('multi_part')} className="text-xs py-1 px-2.5">
                <ListOrdered className="w-3.5 h-3.5 me-1 text-emerald-500" />
                متعدد الفروع (أ، ب، ج)
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleAddQuestion('mcq')} className="text-xs py-1 px-2.5">
                <HelpCircle className="w-3.5 h-3.5 me-1 text-indigo-500" />
                خيارات (MCQ)
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleAddQuestion('true_false')} className="text-xs py-1 px-2.5">
                <CheckCircle2 className="w-3.5 h-3.5 me-1 text-teal-500" />
                صح / خطأ
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleAddQuestion('matching')} className="text-xs py-1 px-2.5">
                <Shuffle className="w-3.5 h-3.5 me-1 text-amber-500" />
                مطابقة وقوائم
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleAddQuestion('calculation')} className="text-xs py-1 px-2.5">
                <Calculator className="w-3.5 h-3.5 me-1 text-rose-500" />
                مسألة ومساحة حل
              </Button>
            </div>
          </div>

          <Button size="sm" variant="ghost" onClick={toggleAllCollapse} className="text-xs text-slate-500">
            <ChevronsUpDown className="w-3.5 h-3.5 me-1" />
            طي / توسيع الكل
          </Button>
        </div>

        {/* Live Total Marks Bar */}
        <div className={`flex items-center justify-between p-3 rounded-lg text-xs font-bold transition-all ${
          isMarksMismatch 
            ? 'bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300' 
            : 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
        }`}>
          <div className="flex items-center gap-2">
            {isMarksMismatch ? (
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            )}
            <span>
              مجموع درجات الأسئلة: {formatDigits(currentTotal, digitStyle)} من أصل {formatDigits(targetTotalMarks, digitStyle)} درجة
            </span>
          </div>

          {isMarksMismatch && (
            <Badge variant="warning" className="text-[11px]">
              الفرق: {formatDigits(Math.abs(targetTotalMarks - currentTotal), digitStyle)} درجة
            </Badge>
          )}
        </div>
      </div>

      {/* List of Question Cards */}
      <div className="space-y-3">
        {questions.length === 0 ? (
          <div className="p-12 text-center border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 text-slate-400">
            <p className="font-bold text-sm mb-1">لا توجد أسئلة مضافة بعد</p>
            <p className="text-xs">اختر نوع السؤال من الأزرار أعلاه لبدء بناء اختبارك</p>
          </div>
        ) : (
          questions.map((q, idx) => (
            <QuestionCard
              key={q.id}
              question={q}
              index={idx}
              digitStyle={digitStyle}
              onUpdate={(updated) => handleUpdate(idx, updated)}
              onMoveUp={() => handleMove(idx, 'up')}
              onMoveDown={() => handleMove(idx, 'down')}
              onDuplicate={() => handleDuplicate(q.id)}
              onDelete={() => handleDelete(q.id)}
              canMoveUp={idx > 0}
              canMoveDown={idx < questions.length - 1}
            />
          ))
        )}
      </div>
    </div>
  );
}
