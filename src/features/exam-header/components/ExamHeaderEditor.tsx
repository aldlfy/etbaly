import type { ExamHeaderData, ExamType, GradingGridPosition } from '../types';
import { EXAM_TYPE_LABELS } from '../types';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { School, Settings2, Sliders } from 'lucide-react';

interface ExamHeaderEditorProps {
  data: ExamHeaderData;
  onChange: (updated: Partial<ExamHeaderData>) => void;
  onOpenSchoolProfile: () => void;
}

export function ExamHeaderEditor({ data, onChange, onOpenSchoolProfile }: ExamHeaderEditorProps) {
  const handleChange = <K extends keyof ExamHeaderData>(field: K, value: ExamHeaderData[K]) => {
    onChange({ [field]: value });
  };

  return (
    <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          <CardTitle className="text-base font-bold">إعدادات ترويسة وبيانات الامتحان</CardTitle>
        </div>
        <Button variant="outline" size="sm" onClick={onOpenSchoolProfile} className="gap-1.5 text-xs">
          <School className="w-4 h-4 text-brand-500" />
          <span>بيانات المدرسة والشعار</span>
        </Button>
      </CardHeader>

      <CardContent className="space-y-5 pt-2">
        {/* Row 1: Subject, Grade, Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              المادة الدراسية:
            </label>
            <input
              type="text"
              value={data.subject}
              onChange={(e) => handleChange('subject', e.target.value)}
              placeholder="مثال: الرياضيات"
              className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              الصف الدراسي:
            </label>
            <input
              type="text"
              value={data.grade}
              onChange={(e) => handleChange('grade', e.target.value)}
              placeholder="مثال: الرابع العلمي"
              className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              الشعبة:
            </label>
            <input
              type="text"
              value={data.section}
              onChange={(e) => handleChange('section', e.target.value)}
              placeholder="مثال: أ / ب"
              className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Row 2: Exam Type, Year, Semester */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              نوع الامتحان:
            </label>
            <select
              value={data.examType}
              onChange={(e) => handleChange('examType', e.target.value as ExamType)}
              className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 font-semibold"
            >
              {Object.entries(EXAM_TYPE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              العام الدراسي:
            </label>
            <input
              type="text"
              value={data.academicYear}
              onChange={(e) => handleChange('academicYear', e.target.value)}
              placeholder="مثال: 2025 - 2026"
              className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              الفصل / الكورس:
            </label>
            <input
              type="text"
              value={data.semester}
              onChange={(e) => handleChange('semester', e.target.value)}
              placeholder="مثال: الكورس الأول"
              className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Row 3: Date, Duration, Total Marks */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              التاريخ:
            </label>
            <input
              type="date"
              value={data.date}
              onChange={(e) => handleChange('date', e.target.value)}
              className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              الوقت المخصص:
            </label>
            <input
              type="text"
              value={data.duration}
              onChange={(e) => handleChange('duration', e.target.value)}
              placeholder="مثال: ساعتان"
              className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              الدرجة الكلية:
            </label>
            <input
              type="number"
              value={data.totalMarks}
              onChange={(e) => handleChange('totalMarks', parseInt(e.target.value, 10) || 100)}
              className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 font-bold text-brand-600 dark:text-brand-400"
            />
          </div>
        </div>

        {/* Row 4: Student Fields & Instructions */}
        <div className="space-y-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
          <div className="flex flex-wrap items-center gap-6 text-xs font-semibold">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={data.showStudentName}
                onChange={(e) => handleChange('showStudentName', e.target.checked)}
                className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
              />
              <span>إظهار سطر اسم الطالب الرباعي</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={data.showExamSeat}
                onChange={(e) => handleChange('showExamSeat', e.target.checked)}
                className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
              />
              <span>إظهار خانة الرقم الامتحاني / القاعة</span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              التعليمات والملاحظات العامة للطلبة:
            </label>
            <input
              type="text"
              value={data.instructions}
              onChange={(e) => handleChange('instructions', e.target.value)}
              placeholder="مثال: ملاحظة: أجب عن خمسة أسئلة فقط، لكل سؤال 20 درجة."
              className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Row 5: Grading Grid Configuration */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-brand-500" />
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              جدول التفقيط والدرجات (مربعات المصحح والمدقق)
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                مكان ظهور الجدول:
              </label>
              <select
                value={data.showGradingGrid ? data.gradingGridPosition : 'none'}
                onChange={(e) => {
                  const val = e.target.value as GradingGridPosition;
                  if (val === 'none') {
                    handleChange('showGradingGrid', false);
                  } else {
                    handleChange('showGradingGrid', true);
                    handleChange('gradingGridPosition', val);
                  }
                }}
                className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500"
              >
                <option value="header">في الترويسة أعلى الورقة</option>
                <option value="footer">في التذييل أسفل الورقة</option>
                <option value="none">بدون جدول درجات</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                عدد أعمدة الأسئلة:
              </label>
              <input
                type="number"
                min={3}
                max={10}
                value={data.questionCountForGrid}
                onChange={(e) => handleChange('questionCountForGrid', parseInt(e.target.value, 10) || 6)}
                className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                اسم مدرس المادة (المصحح):
              </label>
              <input
                type="text"
                value={data.teacherName}
                onChange={(e) => handleChange('teacherName', e.target.value)}
                placeholder="أ. أحمد العراقي"
                className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Row 6: Reviewer & Good Luck Message */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              اسم المدقق:
            </label>
            <input
              type="text"
              value={data.reviewerName}
              onChange={(e) => handleChange('reviewerName', e.target.value)}
              placeholder="أ. مصطفى الحسني"
              className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              رسالة التمنيات في التذييل:
            </label>
            <input
              type="text"
              value={data.goodLuckMessage}
              onChange={(e) => handleChange('goodLuckMessage', e.target.value)}
              placeholder="مع تمنياتنا لجميع طلبتنا الأعزاء بالنجاح الباهر والتفوق"
              className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
