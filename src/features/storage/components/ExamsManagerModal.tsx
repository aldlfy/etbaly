import React, { useState, useEffect } from 'react';
import { 
  FolderOpen, 
  Plus, 
  Trash2, 
  Copy, 
  Download, 
  Upload, 
  FileCheck, 
  Calendar, 
  X,
  Edit2,
  Check
} from 'lucide-react';
import { db } from '@/db';
import type { Exam } from '@/db/models';
import { Button } from '@/components/ui/Button';
import { exportExamToJson, importExamFromJson, triggerDownload } from '../utils/examJson';
import { useExamStore } from '@/stores/examStore';
import { formatDigits } from '@/lib/arabic-numbers';
import type { DigitStyle } from '@/features/layout/types';

interface ExamsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  digitStyle?: DigitStyle;
}

export const ExamsManagerModal: React.FC<ExamsManagerModalProps> = ({
  isOpen,
  onClose,
  digitStyle = 'eastern',
}) => {
  const [examsList, setExamsList] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    examId: activeExamId,
    headerData,
    questions,
    pageSettings,
    loadExamFromRecord,
    resetToDefault,
  } = useExamStore();

  const fetchExams = async () => {
    setLoading(true);
    try {
      const records = await db.exams.orderBy('updatedAt').reverse().toArray();
      setExamsList(records);
    } catch (err) {
      console.error('Error fetching exams from Dexie:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchExams();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOpenExam = (exam: Exam) => {
    loadExamFromRecord(exam);
    onClose();
  };

  const handleCreateNew = () => {
    if (confirm('هل ترغب في إنشاء اختبار جديد؟ سيتم حفظ الاختبار الحالي تلقائياً.')) {
      resetToDefault();
      onClose();
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('هل أنت متأكد من رغبتك في حذف هذا الاختبار نهائياً؟')) {
      await db.exams.delete(id);
      await fetchExams();
      if (activeExamId === id) {
        resetToDefault();
      }
    }
  };

  const handleDuplicate = async (exam: Exam, e: React.MouseEvent) => {
    e.stopPropagation();
    const duplicated: Exam = {
      ...exam,
      id: 'exam-' + Date.now(),
      title: `${exam.title} (نسخة مكررة)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await db.exams.put(duplicated);
    await fetchExams();
  };

  const handleExportJson = (exam: Exam, e: React.MouseEvent) => {
    e.stopPropagation();
    const jsonStr = exportExamToJson(
      exam.id,
      exam.title,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      exam.metadata as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      exam.pageSettings as any,
      exam.questions || []
    );
    const filename = `${exam.title.replace(/[\s/\\:]+/g, '_')}_ExamForge.json`;
    triggerDownload(jsonStr, filename);
  };

  const handleExportCurrentActive = () => {
    const jsonStr = exportExamToJson(
      activeExamId,
      `${headerData.subject} - ${headerData.grade}`,
      headerData,
      pageSettings,
      questions
    );
    const filename = `${headerData.subject}_${headerData.grade}_ExamForge.json`;
    triggerDownload(jsonStr, filename);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const imported = importExamFromJson(text);
        const newRecord: Exam = {
          id: imported.id,
          title: imported.title,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          metadata: imported.metadata as any,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          pageSettings: imported.pageSettings as any,
          questionIds: imported.questions.map((q) => q.id),
          questions: imported.questions,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        await db.exams.put(newRecord);
        await fetchExams();
        handleOpenExam(newRecord);
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : 'فشل قراءة الملف.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSaveRename = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!newTitle.trim()) return;
    const target = examsList.find((ex) => ex.id === id);
    if (target) {
      await db.exams.update(id, { title: newTitle.trim(), updatedAt: Date.now() });
      setEditingId(null);
      await fetchExams();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-cairo">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                إدارة الاختبارات المحفوظة (IndexedDB Manager)
              </h2>
              <p className="text-xs text-slate-500">
                تصفح وافتح اختباراتك السابقة، استورد أو صدّر بصيغة JSON
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

        {/* Actions bar */}
        <div className="px-6 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleCreateNew}
              className="text-xs font-bold"
            >
              <Plus className="w-4 h-4 ml-1" />
              اختبار جديد
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleExportCurrentActive}
              className="text-xs font-bold"
              title="تصدير الاختبار النشط كملف JSON"
            >
              <Download className="w-4 h-4 ml-1" />
              تصدير الحالي (JSON)
            </Button>

            <label className="cursor-pointer">
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleImportJson}
                className="hidden"
              />
              <span className="inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-sm transition-colors">
                <Upload className="w-4 h-4 ml-1" />
                استيراد ملف JSON
              </span>
            </label>
          </div>

          <span className="text-xs text-slate-500">
            إجمالي الاختبارات: {formatDigits(examsList.length, digitStyle)}
          </span>
        </div>

        {errorMsg && (
          <div className="mx-6 my-2 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-200 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Exams List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              جاري تحميل الاختبارات...
            </div>
          ) : examsList.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-bold text-sm">لا توجد اختبارات محفوظة في قاعدة البيانات حتى الآن.</p>
              <p className="text-xs text-slate-400 mt-1">
                اضغط زر &quot;حفظ&quot; في الشريط العلوي لحفظ اختبارك الحالي محلياً.
              </p>
            </div>
          ) : (
            examsList.map((exam) => {
              const isActive = exam.id === activeExamId;
              const dateStr = new Date(exam.updatedAt || exam.createdAt).toLocaleDateString('ar-IQ', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={exam.id}
                  onClick={() => handleOpenExam(exam)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    isActive
                      ? 'border-brand-500 bg-brand-50/40 dark:bg-brand-950/30 dark:border-brand-600'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:border-brand-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div
                      className={`p-2.5 rounded-lg shrink-0 ${
                        isActive
                          ? 'bg-brand-500 text-white'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <FileCheck className="w-5 h-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      {editingId === exam.id ? (
                        <div
                          className="flex items-center gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="text"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            className="px-2 py-1 text-xs rounded border border-brand-500 bg-white dark:bg-slate-800 font-bold w-full max-w-xs"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={(e) => handleSaveRename(exam.id, e)}
                            className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-700"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                            {exam.title}
                          </h4>
                          {isActive && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-brand-500 text-white">
                              النشط حالياً
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {dateStr}
                        </span>
                        <span>•</span>
                        <span>
                          {formatDigits(exam.questions?.length || exam.questionIds?.length || 0, digitStyle)} أسئلة
                        </span>
                        <span>•</span>
                        <span>{exam.pageSettings?.pageSize || 'A4'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingId(exam.id);
                        setNewTitle(exam.title);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                      title="إعادة التسمية"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleDuplicate(exam, e)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                      title="تكرار نسخة"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleExportJson(exam, e)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                      title="تصدير كملف JSON"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleDelete(exam.id, e)}
                      className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      title="حذف الاختبار"
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
