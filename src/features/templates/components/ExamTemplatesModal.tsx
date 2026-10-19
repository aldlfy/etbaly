import React, { useState } from 'react';
import { 
  X, 
  FileCheck2, 
  Layers, 
  BookOpen, 
  Clock, 
  Award,
  Search,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SAMPLE_EXAM_TEMPLATES, type ExamTemplateItem } from '../data/sampleExams';
import { useExamStore } from '@/stores/examStore';
import { formatDigits } from '@/lib/arabic-numbers';
import type { DigitStyle } from '@/features/layout/types';

interface ExamTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  digitStyle?: DigitStyle;
}

export const ExamTemplatesModal: React.FC<ExamTemplatesModalProps> = ({
  isOpen,
  onClose,
  digitStyle = 'eastern',
}) => {
  const { loadExamFromRecord } = useExamStore();
  const [selectedTemplate, setSelectedTemplate] = useState<ExamTemplateItem>(SAMPLE_EXAM_TEMPLATES[0]);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loadedToast, setLoadedToast] = useState(false);

  if (!isOpen) return null;

  const filteredTemplates = SAMPLE_EXAM_TEMPLATES.filter((t) => {
    const matchSubject = selectedSubjectFilter === 'all' || t.subject === selectedSubjectFilter;
    const matchSearch = !searchTerm || 
      t.name.includes(searchTerm) || 
      t.subject.includes(searchTerm) || 
      t.grade.includes(searchTerm) || 
      t.description.includes(searchTerm);
    return matchSubject && matchSearch;
  });

  const handleApplyTemplate = (item: ExamTemplateItem) => {
    if (window.confirm(`هل أنت متأكد من رغبتك في تحميل "${item.name}"؟ سيتم استبدال محتوى ورقة الامتحان الحالية.`)) {
      loadExamFromRecord(item.exam);
      setLoadedToast(true);
      setTimeout(() => {
        setLoadedToast(false);
        onClose();
      }, 900);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-cairo">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                  نماذج الامتحانات الوزارية الجاهزة (1-Click Exam Templates)
                </h2>
                <Badge variant="success" className="text-[10px]">
                  مكتمل وجاهز للطباعة
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                اختر نموذجاً وزارياً متكاملاً بجميع أسئلته وترويسته وسلم درجاته لتحميله فوراً بنقرة واحدة
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Loaded Toast Banner */}
        {loadedToast && (
          <div className="px-6 py-3 bg-emerald-50 dark:bg-emerald-950/60 border-b border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-fade-in">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>تم تحميل نموذج الامتحان بنجاح إلى ورقة الامتحان!</span>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-600 dark:text-slate-400">المادة:</span>
            <div className="flex items-center gap-1">
              {[
                { id: 'all', label: 'جميع المواد' },
                { id: 'الفيزياء', label: 'الفيزياء' },
                { id: 'الرياضيات', label: 'الرياضيات' },
                { id: 'الكيمياء', label: 'الكيمياء' },
              ].map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => setSelectedSubjectFilter(sub.id)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                    selectedSubjectFilter === sub.id
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="بحث في النماذج..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>

        {/* Body 2-Column Split: List + Preview */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[350px]">
          {/* Left Column: Template Cards List */}
          <div className="md:col-span-5 border-l border-slate-200 dark:border-slate-800 overflow-y-auto p-4 space-y-3 bg-slate-50/50 dark:bg-slate-900/50">
            {filteredTemplates.map((item) => {
              const isSelected = selectedTemplate?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedTemplate(item)}
                  className={`p-3.5 rounded-xl border text-right cursor-pointer transition-all ${
                    isSelected
                      ? 'border-teal-500 bg-teal-50/40 dark:bg-teal-950/30 shadow-sm ring-1 ring-teal-500/50'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                      {item.name}
                    </span>
                    <Badge variant={isSelected ? 'success' : 'neutral'} className="text-[10px] shrink-0 mr-2">
                      {item.examTypeLabel}
                    </Badge>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mb-2 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold">
                      {item.subject}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {item.grade}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {formatDigits(item.exam.questions?.length || 5, digitStyle)} أسئلة
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Selected Template Deep Preview */}
          <div className="md:col-span-7 overflow-y-auto p-6 space-y-5 bg-white dark:bg-slate-900">
            {selectedTemplate && (
              <>
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h3 className="font-black text-sm text-slate-900 dark:text-white mb-1">
                      {selectedTemplate.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {selectedTemplate.description}
                    </p>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleApplyTemplate(selectedTemplate)}
                    className="shrink-0 bg-teal-600 hover:bg-teal-700 font-bold text-xs"
                  >
                    <FileCheck2 className="w-3.5 h-3.5 ml-1.5" />
                    تحميل في ورقة الامتحان
                  </Button>
                </div>

                {/* Metadata Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <div className="text-[10px] text-slate-500 flex items-center gap-1 mb-0.5">
                      <BookOpen className="w-3 h-3 text-teal-600" />
                      <span>المادة والصف</span>
                    </div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">
                      {selectedTemplate.subject} ({selectedTemplate.grade})
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <div className="text-[10px] text-slate-500 flex items-center gap-1 mb-0.5">
                      <Clock className="w-3 h-3 text-teal-600" />
                      <span>زمن الاختبار</span>
                    </div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">
                      {selectedTemplate.exam.metadata.duration}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <div className="text-[10px] text-slate-500 flex items-center gap-1 mb-0.5">
                      <Award className="w-3 h-3 text-teal-600" />
                      <span>المجموع الكلي</span>
                    </div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">
                      {formatDigits(selectedTemplate.exam.metadata.totalMarks, digitStyle)} درجة
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <div className="text-[10px] text-slate-500 flex items-center gap-1 mb-0.5">
                      <Layers className="w-3 h-3 text-teal-600" />
                      <span>عدد الأسئلة</span>
                    </div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">
                      {formatDigits(selectedTemplate.exam.questions?.length || 0, digitStyle)} أسئلة وزارية
                    </div>
                  </div>
                </div>

                {/* Instructions Box */}
                <div className="p-3 rounded-lg bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-300">
                  <span className="font-extrabold ml-1">توجيهات الاختبار:</span>
                  <span>{selectedTemplate.exam.metadata.instructions?.[0] || 'أجب عن الأسئلة بدقة'}</span>
                </div>

                {/* Questions Preview List */}
                <div className="space-y-3">
                  <h4 className="font-extrabold text-xs text-slate-700 dark:text-slate-300">
                    قائمة أسئلة النموذج:
                  </h4>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {selectedTemplate.exam.questions?.map((q, idx) => (
                      <div
                        key={q.id}
                        className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs flex items-start justify-between gap-3"
                      >
                        <div className="flex items-start gap-2">
                          <span className="w-6 h-6 rounded bg-slate-200 dark:bg-slate-700 font-bold flex items-center justify-center shrink-0 text-[11px]">
                            {formatDigits(idx + 1, digitStyle)}
                          </span>
                          <div>
                            <span className="font-bold text-slate-800 dark:text-slate-200 block mb-0.5">
                              {q.title || `السؤال ${formatDigits(idx + 1, digitStyle)}`}
                            </span>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                              {q.prompt.replace(/\$[^$]+\$/g, '[معادلة]')}
                            </p>
                          </div>
                        </div>

                        <Badge variant="neutral" className="text-[10px] shrink-0 font-bold">
                          {formatDigits(q.marks, digitStyle)} درجة
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            يمكنك تخصيص وحذف وإضافة وتعديل أي سؤال بعد تحميل النموذج.
          </span>
          <Button variant="outline" size="sm" onClick={onClose}>
            إغلاق
          </Button>
        </div>
      </div>
    </div>
  );
};
