import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Search, 
  Plus, 
  Trash2, 
  X, 
  Tag
} from 'lucide-react';
import { db } from '@/db';
import type { QuestionBankItem } from '@/db/models';
import type { QuestionData } from '@/features/questions/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatDigits } from '@/lib/arabic-numbers';
import type { DigitStyle } from '@/features/layout/types';
import { renderMathInText } from '@/lib/katex';

interface QuestionBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertQuestion: (q: QuestionData) => void;
  digitStyle?: DigitStyle;
}

export const QuestionBankModal: React.FC<QuestionBankModalProps> = ({
  isOpen,
  onClose,
  onInsertQuestion,
  digitStyle = 'eastern',
}) => {
  const [items, setItems] = useState<QuestionBankItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  const fetchBankItems = async () => {
    setLoading(true);
    try {
      const records = await db.questionBank.orderBy('createdAt').reverse().toArray();
      setItems(records);
    } catch (err) {
      console.error('Error fetching question bank:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchBankItems();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const subjects = Array.from(new Set(items.map((it) => it.subject).filter(Boolean)));

  const filteredItems = items.filter((it) => {
    const matchesSearch =
      searchQuery === '' ||
      it.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      it.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (it.chapter && it.chapter.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSubject = selectedSubject === 'all' || it.subject === selectedSubject;
    const matchesDifficulty = selectedDifficulty === 'all' || it.difficulty === selectedDifficulty;

    return matchesSearch && matchesSubject && matchesDifficulty;
  });

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('هل ترغب في حذف هذا السؤال من بنك الأسئلة؟')) {
      await db.questionBank.delete(id);
      await fetchBankItems();
    }
  };

  const handleInsert = (item: QuestionBankItem) => {
    const qData: QuestionData = item.questionData
      ? { ...item.questionData, id: 'q-' + Date.now() }
      : {
          id: 'q-' + Date.now(),
          type: (item.type as QuestionData['type']) || 'essay',
          prompt: item.content,
          marks: item.marks || 15,
          direction: 'rtl',
        };

    onInsertQuestion(qData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-cairo">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                بنك الأسئلة المحلي (IndexedDB Question Bank)
              </h2>
              <p className="text-xs text-slate-500">
                ابحث في أسئلتك المحفوظة وادرجها مباشرة في ورقة الامتحان الحالية
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          {/* Search box */}
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالنص، الموضوع، أو الوسم..."
              className="w-full pr-9 pl-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
            />
          </div>

          {/* Subject Filter */}
          <div>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
            >
              <option value="all">كل المواد ({items.length})</option>
              {subjects.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
            >
              <option value="all">كل المستويات</option>
              <option value="easy">سهل</option>
              <option value="medium">متوسط</option>
              <option value="hard">صعب</option>
            </select>
          </div>
        </div>

        {/* Question Cards List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              جاري تحميل بنك الأسئلة...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Database className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-bold text-sm">لا توجد أسئلة مطابقة للبحث في بنك الأسئلة.</p>
              <p className="text-xs text-slate-400 mt-1">
                يمكنك حفظ أي سؤال في البنك من بطاقة السؤال في منشئ الأسئلة.
              </p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const diffColors = {
                easy: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
                medium: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
                hard: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300',
              };

              const diffLabels = {
                easy: 'سهل',
                medium: 'متوسط',
                hard: 'صعب',
              };

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:border-brand-300 dark:hover:border-slate-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="font-bold text-xs text-brand-700 dark:text-brand-300">
                        {item.subject}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="text-xs text-slate-600 dark:text-slate-300">
                        {item.grade}
                      </span>
                      {item.chapter && (
                        <>
                          <span className="text-slate-400">•</span>
                          <span className="text-xs text-slate-500 font-medium">
                            {item.chapter}
                          </span>
                        </>
                      )}
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          diffColors[item.difficulty] || diffColors.medium
                        }`}
                      >
                        {diffLabels[item.difficulty] || 'متوسط'}
                      </span>
                      <Badge variant="neutral" className="text-[10px]">
                        {formatDigits(item.marks, digitStyle)} درجة
                      </Badge>
                    </div>

                    {/* Question prompt with rendered math */}
                    <div
                      className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-relaxed mb-2"
                      dangerouslySetInnerHTML={{
                        __html: renderMathInText(item.content),
                      }}
                    />

                    {/* Tags */}
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        {item.tags.map((t) => (
                          <span
                            key={t}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px]"
                          >
                            <Tag className="w-2.5 h-2.5" />
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => handleInsert(item)}
                      className="text-xs font-bold"
                    >
                      <Plus className="w-3.5 h-3.5 ml-1" />
                      إدراج في الامتحان
                    </Button>

                    <button
                      type="button"
                      onClick={(e) => handleDelete(item.id, e)}
                      className="p-2 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      title="حذف من البنك"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
