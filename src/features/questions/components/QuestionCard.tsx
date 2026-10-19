import type { QuestionData } from '../types';
import { QUESTION_TYPE_LABELS } from '../types';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDigits } from '@/lib/arabic-numbers';
import { 
  ChevronUp, 
  ChevronDown, 
  Copy, 
  Trash2, 
  ChevronRight, 
  Plus, 
  AlignRight, 
  AlignLeft,
  SeparatorHorizontal
} from 'lucide-react';

interface QuestionCardProps {
  question: QuestionData;
  index: number;
  digitStyle?: 'eastern' | 'western';
  onUpdate: (updated: Partial<QuestionData>) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export function QuestionCard({
  question,
  index,
  digitStyle = 'eastern',
  onUpdate,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  canMoveUp,
  canMoveDown,
}: QuestionCardProps) {
  const isCollapsed = question.isCollapsed ?? false;

  const toggleCollapse = () => {
    onUpdate({ isCollapsed: !isCollapsed });
  };

  const handlePromptChange = (val: string) => {
    onUpdate({ prompt: val });
  };

  const handleMarksChange = (val: number) => {
    onUpdate({ marks: Math.max(1, val) });
  };

  // Helper to add multi-part branch
  const handleAddPart = () => {
    const parts = question.parts || [];
    const letters = ['أ', 'ب', 'ج', 'د', 'هـ', 'و'];
    const letter = letters[parts.length % letters.length];
    const newPart = {
      id: 'part-' + Date.now(),
      letter,
      content: 'فرع جديد...',
      marks: 5,
    };
    onUpdate({ parts: [...parts, newPart] });
  };

  // Helper to add MCQ option
  const handleAddOption = () => {
    const opts = question.mcqOptions || [];
    const letters = ['أ', 'ب', 'ج', 'د', 'هـ'];
    const letter = letters[opts.length % letters.length];
    const newOpt = {
      id: 'opt-' + Date.now(),
      letter,
      text: 'خيار جديد...',
    };
    onUpdate({ mcqOptions: [...opts, newOpt] });
  };

  return (
    <Card className="border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all">
      {/* Card Header */}
      <CardHeader className="flex flex-row items-center justify-between py-2.5 px-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleCollapse}
            className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-transform"
            title={isCollapsed ? 'توسيع' : 'طي'}
          >
            <ChevronRight className={`w-4 h-4 transition-transform ${isCollapsed ? '' : 'rotate-90'}`} />
          </button>

          <span className="font-extrabold text-sm text-brand-700 dark:text-brand-300">
            س{formatDigits(index + 1, digitStyle)}
          </span>

          <Badge variant="primary" className="text-[11px]">
            {QUESTION_TYPE_LABELS[question.type]}
          </Badge>

          {isCollapsed && (
            <span className="text-xs text-slate-500 truncate max-w-xs font-medium">
              {question.prompt.replace(/<[^>]*>/g, '').substring(0, 40)}...
            </span>
          )}

          {question.pageBreakBefore && (
            <Badge variant="warning" className="text-[10px]">
              صفحة جديدة
            </Badge>
          )}
        </div>

        {/* Actions & Marks */}
        <div className="flex items-center gap-2">
          {/* Page break toggle */}
          <button
            type="button"
            onClick={() => onUpdate({ pageBreakBefore: !question.pageBreakBefore })}
            className={`p-1 rounded text-xs transition-colors ${
              question.pageBreakBefore
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200 font-bold'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
            title={question.pageBreakBefore ? 'إلغاء فاصل الصفحة' : 'بدء هذا السؤال في صفحة جديدة'}
          >
            <SeparatorHorizontal className="w-3.5 h-3.5" />
          </button>

          {/* Marks input */}
          <label className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300">
            <span>الدرجة:</span>
            <input
              type="number"
              min={1}
              max={100}
              value={question.marks}
              onChange={(e) => handleMarksChange(parseInt(e.target.value, 10) || 10)}
              className="w-14 px-1.5 py-0.5 text-xs text-center font-bold rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
          </label>

          {/* Direction toggle */}
          <button
            type="button"
            onClick={() => onUpdate({ direction: question.direction === 'rtl' ? 'ltr' : 'rtl' })}
            className="p-1 rounded text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            title={`الاتجاه: ${question.direction === 'rtl' ? 'عربي' : 'إنجليزي'}`}
          >
            {question.direction === 'rtl' ? <AlignRight className="w-3.5 h-3.5" /> : <AlignLeft className="w-3.5 h-3.5" />}
          </button>

          {/* Move Up */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onMoveUp}
            disabled={!canMoveUp}
            className="p-1 text-slate-500"
            title="تحريك لأعلى"
          >
            <ChevronUp className="w-4 h-4" />
          </Button>

          {/* Move Down */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onMoveDown}
            disabled={!canMoveDown}
            className="p-1 text-slate-500"
            title="تحريك لأسفل"
          >
            <ChevronDown className="w-4 h-4" />
          </Button>

          {/* Duplicate */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onDuplicate}
            className="p-1 text-slate-500"
            title="تكرار السؤال"
          >
            <Copy className="w-4 h-4" />
          </Button>

          {/* Delete */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="p-1 text-rose-500 hover:text-rose-700"
            title="حذف السؤال"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      {/* Card Content (Visible when expanded) */}
      {!isCollapsed && (
        <CardContent className="p-4 space-y-4">
          {/* Main Question Prompt Textarea */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              نص السؤال الرئيسي (يدعم صيغ المعادلات $...$):
            </label>
            <textarea
              rows={2}
              value={question.prompt}
              onChange={(e) => handlePromptChange(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 font-medium"
              placeholder="اكتب صيغة السؤال هنا..."
            />
          </div>

          {/* Type-specific editor controls */}

          {/* 1. Multi-part questions (أ، ب، ج) */}
          {question.type === 'multi_part' && (
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  فروع السؤال (أ، ب، ج...):
                </span>
                <Button size="sm" variant="outline" onClick={handleAddPart} className="text-xs gap-1 py-1 px-2">
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة فرع</span>
                </Button>
              </div>

              {(question.parts || []).map((part, pIdx) => (
                <div key={part.id} className="flex items-center gap-2 text-xs">
                  <span className="font-extrabold w-6 text-center">({part.letter})</span>
                  <input
                    type="text"
                    value={part.content}
                    onChange={(e) => {
                      const updated = [...(question.parts || [])];
                      updated[pIdx].content = e.target.value;
                      onUpdate({ parts: updated });
                    }}
                    className="flex-1 px-2.5 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    placeholder="نص الفرع..."
                  />
                  <input
                    type="number"
                    min={1}
                    value={part.marks}
                    onChange={(e) => {
                      const updated = [...(question.parts || [])];
                      updated[pIdx].marks = parseInt(e.target.value, 10) || 5;
                      onUpdate({ parts: updated });
                    }}
                    className="w-16 px-1 py-1 text-xs text-center rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                    title="درجة الفرع"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updated = (question.parts || []).filter((_, i) => i !== pIdx);
                      onUpdate({ parts: updated });
                    }}
                    className="text-rose-500 hover:text-rose-700 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 2. MCQ options editor */}
          {question.type === 'mcq' && (
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  خيارات الإجابة:
                </span>
                <div className="flex items-center gap-2">
                  <select
                    value={question.mcqLayout || 'horizontal'}
                    onChange={(e) => onUpdate({ mcqLayout: e.target.value as 'horizontal' | 'vertical' })}
                    className="text-xs px-2 py-0.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value="horizontal">توزيع أفقي</option>
                    <option value="vertical">توزيع عمودي</option>
                  </select>
                  <Button size="sm" variant="outline" onClick={handleAddOption} className="text-xs gap-1 py-1 px-2">
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة خيار</span>
                  </Button>
                </div>
              </div>

              {(question.mcqOptions || []).map((opt, oIdx) => (
                <div key={opt.id} className="flex items-center gap-2 text-xs">
                  <span className="font-bold w-6 text-center">({opt.letter})</span>
                  <input
                    type="text"
                    value={opt.text}
                    onChange={(e) => {
                      const updated = [...(question.mcqOptions || [])];
                      updated[oIdx].text = e.target.value;
                      onUpdate({ mcqOptions: updated });
                    }}
                    className="flex-1 px-2.5 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    placeholder="نص الخيار..."
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updated = (question.mcqOptions || []).filter((_, i) => i !== oIdx);
                      onUpdate({ mcqOptions: updated });
                    }}
                    className="text-rose-500 hover:text-rose-700 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 3. Calculation Space settings */}
          {question.type === 'calculation' && (
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  نوع مساحة الإجابة المخصصة:
                </label>
                <select
                  value={question.answerSpaceType || 'dotted_lines'}
                  onChange={(e) => onUpdate({ answerSpaceType: e.target.value as 'dotted_lines' | 'grid_box' | 'blank' })}
                  className="w-full px-2.5 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="dotted_lines">أسطر منقطة للكتابة</option>
                  <option value="grid_box">مربع شبكة بيانية (Grid)</option>
                  <option value="blank">فراغ أبيض حر</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ارتفاع مساحة الإجابة (عدد الأسطر):
                </label>
                <input
                  type="number"
                  min={2}
                  max={20}
                  value={question.answerSpaceLines || 5}
                  onChange={(e) => onUpdate({ answerSpaceLines: parseInt(e.target.value, 10) || 5 })}
                  className="w-full px-2.5 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
