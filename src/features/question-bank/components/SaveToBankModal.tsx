import React, { useState } from 'react';
import { BookmarkPlus, X, Tag } from 'lucide-react';
import { db } from '@/db';
import type { QuestionData } from '@/features/questions/types';
import { Button } from '@/components/ui/Button';

interface SaveToBankModalProps {
  question: QuestionData;
  defaultSubject: string;
  defaultGrade: string;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export const SaveToBankModal: React.FC<SaveToBankModalProps> = ({
  question,
  defaultSubject,
  defaultGrade,
  isOpen,
  onClose,
  onSaved,
}) => {
  const [subject, setSubject] = useState(defaultSubject || 'الرياضيات');
  const [grade, setGrade] = useState(defaultGrade || 'الرابع العلمي');
  const [chapter, setChapter] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [tagsInput, setTagsInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const tags = tagsInput
        .split(/[,،]/)
        .map((t) => t.trim())
        .filter(Boolean);

      await db.questionBank.put({
        id: 'bank-q-' + Date.now(),
        subject: subject.trim(),
        grade: grade.trim(),
        chapter: chapter.trim() || undefined,
        difficulty,
        type: question.type,
        content: question.prompt,
        marks: question.marks,
        tags,
        questionData: question,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      console.error('Failed to save to Question Bank:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-cairo">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <BookmarkPlus className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              حفظ السؤال في بنك الأسئلة المحلي
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
          {/* Question Preview Snippet */}
          <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="font-bold text-slate-500 block mb-1">نص السؤال:</span>
            <p className="text-slate-800 dark:text-slate-200 font-medium line-clamp-2">
              {question.prompt.replace(/<[^>]*>/g, '')}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                المادة الدراسية
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
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
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                الفصل / الوحدة (اختياري)
              </label>
              <input
                type="text"
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                placeholder="مثال: الفصل الأول - المتجهات"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
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
                <option value="easy">سهل (تذكر وفهم)</option>
                <option value="medium">متوسط (تطبيق وتحليل)</option>
                <option value="hard">صعب (مهارات تفكير عليا)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              الوسوم والكلمات الدلالية (Tags مفصولة بفواصل)
            </label>
            <div className="relative">
              <Tag className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="مثال: معادلات، جذور، قانون كولوم"
                className="w-full pr-9 pl-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              إلغاء
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSaving}>
              حفظ في البنك
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
