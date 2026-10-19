import { useState } from 'react';
import { SAMPLE_QUESTIONS, type SampleQuestion } from '../data/sampleQuestions';
import { renderLatex } from '@/lib/katex';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDigits } from '@/lib/arabic-numbers';
import { BookOpen, Plus, Check } from 'lucide-react';

interface SampleQuestionsViewerProps {
  onInsertQuestion?: (question: SampleQuestion) => void;
  digitStyle?: 'eastern' | 'western';
}

export function SampleQuestionsViewer({ onInsertQuestion, digitStyle = 'eastern' }: SampleQuestionsViewerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [insertedId, setInsertedId] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'جميع الأسئلة النموذجية (30 سؤال)' },
    { id: 'algebra', label: 'الجبر والحساب' },
    { id: 'calculus', label: 'التفاضل والتكامل' },
    { id: 'mechanics', label: 'الميكانيكا والحركة' },
    { id: 'circuits', label: 'الدوائر الكهربائية' },
    { id: 'chemistry', label: 'الكيمياء والتفاعلات' },
    { id: 'english', label: 'اللغة الإنجليزية' },
  ];

  const filtered = selectedCategory === 'all'
    ? SAMPLE_QUESTIONS
    : SAMPLE_QUESTIONS.filter((q) => q.category === selectedCategory);

  const renderContentWithMath = (html: string) => {
    // Replace $...$ math expressions with KaTeX rendered output
    return html.replace(/\$([^$]+)\$/g, (_, math) => {
      return renderLatex(math, { displayMode: false });
    });
  };

  const handleInsert = (q: SampleQuestion) => {
    onInsertQuestion?.(q);
    setInsertedId(q.id);
    setTimeout(() => setInsertedId(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Category filter pills */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setSelectedCategory(c.id)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              selectedCategory === c.id
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Questions list */}
      <div className="grid grid-cols-1 gap-4">
        {filtered.map((q, idx) => {
          const parsedContent = renderContentWithMath(q.content);
          const isInserted = insertedId === q.id;

          return (
            <Card key={q.id} hoverable className="border-slate-200 dark:border-slate-800">
              <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b border-slate-100 dark:border-slate-800/60">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-brand-500" />
                  <CardTitle className="text-sm font-bold">{q.title}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="primary" className="text-[11px]">
                    {q.categoryLabel}
                  </Badge>
                  <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400">
                    ({formatDigits(q.marks, digitStyle)} درجات)
                  </span>
                </div>
              </CardHeader>

              <CardContent className="p-4 space-y-3">
                <div
                  dir={q.direction}
                  className={`text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-200 font-cairo ${
                    q.direction === 'ltr' ? 'text-left font-sans' : 'text-right'
                  }`}
                  dangerouslySetInnerHTML={{ __html: parsedContent }}
                />

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/40">
                  <span className="text-[10px] text-slate-400 font-mono">
                    معرف النموذج: #{idx + 1} ({q.id})
                  </span>

                  <Button
                    variant={isInserted ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => handleInsert(q)}
                    className="text-xs gap-1.5"
                  >
                    {isInserted ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400">تم الإدراج</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5 text-brand-500" />
                        <span>إدراج في ورقة الامتحان</span>
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
