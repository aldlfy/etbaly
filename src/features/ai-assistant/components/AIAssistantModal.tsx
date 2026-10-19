import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  Lock, 
  Plus 
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import type { QuestionData, QuestionType } from '@/features/questions/types';
import { QUESTION_TYPE_LABELS } from '@/features/questions/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { generateAIQuestion } from '../services/aiService';
import { renderMathInText } from '@/lib/katex';
import { formatDigits } from '@/lib/arabic-numbers';
import type { DigitStyle } from '@/features/layout/types';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSubject: string;
  defaultGrade: string;
  onInsertQuestion: (q: QuestionData) => void;
  onOpenSubscriptionModal: () => void;
  digitStyle?: DigitStyle;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  defaultSubject,
  defaultGrade,
  onInsertQuestion,
  onOpenSubscriptionModal,
  digitStyle = 'eastern',
}) => {
  const { entitlement } = useAuthStore();
  const [allowDemoMode, setAllowDemoMode] = useState(false);

  const [subject, setSubject] = useState(defaultSubject || 'الفيزياء');
  const [grade, setGrade] = useState(defaultGrade || 'الرابع العلمي');
  const [topic, setTopic] = useState('');
  const [questionType, setQuestionType] = useState<QuestionType>('calculation');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [instructions, setInstructions] = useState('');

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestion, setGeneratedQuestion] = useState<QuestionData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const isPro = entitlement.isActive || allowDemoMode;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const res = await generateAIQuestion({
        subject,
        grade,
        topic: topic.trim() || undefined,
        questionType,
        difficulty,
        instructions: instructions.trim() || undefined,
      });

      if (res.success && res.question) {
        setGeneratedQuestion(res.question);
      } else {
        setErrorMsg(res.error || 'فشل توليد السؤال، يرجى المحاولة مرة أخرى.');
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInsert = () => {
    if (generatedQuestion) {
      onInsertQuestion(generatedQuestion);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-cairo">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[88vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                  المساعد الذكي لإعداد الأسئلة (AI Exam Forge)
                </h2>
                <Badge variant={isPro ? 'primary' : 'warning'} className="text-[10px]">
                  {isPro ? 'برو مفعل (Pro)' : 'ميزة مدفوعة'}
                </Badge>
              </div>
              <p className="text-xs text-slate-500">
                توليد أسئلة مطابقة للمناهج الوزارية بالذكاء الاصطناعي مع معادلات LaTeX وسلم درجات
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {!isPro ? (
            /* Locked State for Free Users */
            <div className="py-12 px-4 text-center max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
                <Lock className="w-8 h-8" />
              </div>

              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-1">
                  مساعد الذكاء الاصطناعي متاح لمشتركي باقة برو (Pro)
                </h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  احصل على وصول غير محدود لتوليد مسائل رياضية وفيزيائية وكيميائية معقدة بضغطة زر واحدة مطابقة للمناهج الدراسية الرسمية.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={() => {
                    onClose();
                    onOpenSubscriptionModal();
                  }}
                  className="w-full sm:w-auto font-bold"
                >
                  تفعيل رمز الاشتراك الآن
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setAllowDemoMode(true)}
                  className="w-full sm:w-auto text-xs"
                >
                  تجربة النموذج التجريبي
                </Button>
              </div>
            </div>
          ) : (
            /* Active AI Generator Studio */
            <div className="space-y-6">
              <form onSubmit={handleGenerate} className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      المادة
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      الصف / المرحلة
                    </label>
                    <input
                      type="text"
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      الفصل أو الموضوع
                    </label>
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="مثال: الحث الكهرومغناطيسي"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      نوع السؤال المطلوب
                    </label>
                    <select
                      value={questionType}
                      onChange={(e) => setQuestionType(e.target.value as QuestionType)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                    >
                      {Object.entries(QUESTION_TYPE_LABELS).map(([k, label]) => (
                        <option key={k} value={k}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      مستوى الصعوبة
                    </label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                    >
                      <option value="easy">سهل (مفاهيم أساسية وتذكر)</option>
                      <option value="medium">متوسط (تطبيق ومنهجي)</option>
                      <option value="hard">صعب (وزاري متميز ومسائل مركبة)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    تعليمات إضافية للذكاء الاصطناعي (اختياري)
                  </label>
                  <input
                    type="text"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="مثال: ركز على الرسم التوضيحي، أو استخدم أرقاماً بدون كسور عشرية..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="text-[11px] text-slate-500">
                    يتم تنسيق الصيغ الرياضية والكيميائية تلقائياً برموز KaTeX معقمة الاتجاه.
                  </div>

                  <Button type="submit" variant="primary" size="md" isLoading={isGenerating}>
                    <Sparkles className="w-4 h-4 ml-1.5" />
                    توليد السؤال بالذكاء الاصطناعي
                  </Button>
                </div>
              </form>

              {errorMsg && (
                <div className="p-3 rounded-lg bg-rose-50 text-rose-800 text-xs font-semibold">
                  {errorMsg}
                </div>
              )}

              {/* Generated Question Preview Card */}
              {generatedQuestion && (
                <div className="p-5 rounded-2xl border-2 border-brand-500 bg-brand-50/20 dark:bg-brand-950/20 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-brand-200 dark:border-brand-900">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-brand-700 dark:text-brand-300">
                        معاينة السؤال المُولَّد:
                      </span>
                      <Badge variant="primary" className="text-[10px]">
                        {QUESTION_TYPE_LABELS[generatedQuestion.type]}
                      </Badge>
                      <Badge variant="neutral" className="text-[10px]">
                        {formatDigits(generatedQuestion.marks, digitStyle)} درجات
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={handleInsert}
                        className="font-bold"
                      >
                        <Plus className="w-3.5 h-3.5 ml-1" />
                        إدراج في ورقة الامتحان
                      </Button>
                    </div>
                  </div>

                  {/* Rendered prompt with KaTeX */}
                  <div
                    className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: renderMathInText(generatedQuestion.prompt),
                    }}
                  />

                  {/* Multi-part branches preview */}
                  {generatedQuestion.parts && (
                    <div className="space-y-2 pr-3 border-r-2 border-brand-300">
                      {generatedQuestion.parts.map((p) => (
                        <div key={p.id} className="flex items-start justify-between text-xs gap-3">
                          <div className="flex items-start gap-1.5">
                            <span className="font-extrabold">({p.letter})</span>
                            <div
                              dangerouslySetInnerHTML={{
                                __html: renderMathInText(p.content),
                              }}
                            />
                          </div>
                          <span className="font-bold text-slate-600 shrink-0">
                            ({formatDigits(p.marks, digitStyle)} درجات)
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* MCQ options preview */}
                  {generatedQuestion.mcqOptions && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {generatedQuestion.mcqOptions.map((opt) => (
                        <div
                          key={opt.id}
                          className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center gap-2"
                        >
                          <span className="font-extrabold text-brand-600">({opt.letter})</span>
                          <span
                            dangerouslySetInnerHTML={{
                              __html: renderMathInText(opt.text),
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
