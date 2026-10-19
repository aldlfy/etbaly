import React, { useState } from 'react';
import {
  Printer,
  Columns,
  Maximize2,
  Minimize2,
  Sparkles,
  Check,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import type { ExamPageSettings, PageSize, PageOrientation, BaseFont, MarginPreset } from '../types';
import { MARGIN_PRESETS } from '../types';
import { calculateFitOptimizer } from '../utils/pagination';
import type { QuestionData } from '@/features/questions/types';
import type { ExamHeaderData } from '@/features/exam-header/types';

interface LayoutControlsProps {
  settings: ExamPageSettings;
  questions: QuestionData[];
  header: ExamHeaderData;
  onUpdateSettings: (updated: Partial<ExamPageSettings>) => void;
  onPrint: () => void;
}

export const LayoutControls: React.FC<LayoutControlsProps> = ({
  settings,
  questions,
  header,
  onUpdateSettings,
  onPrint,
}) => {
  const [fitMessage, setFitMessage] = useState<{ text: string; success: boolean } | null>(null);

  const handleMarginPresetChange = (preset: MarginPreset) => {
    if (preset !== 'custom') {
      onUpdateSettings({
        marginPreset: preset,
        margins: MARGIN_PRESETS[preset],
      });
    }
  };

  const handleFitPages = (target: 1 | 2) => {
    const res = calculateFitOptimizer(questions, header, settings, target);
    setFitMessage({ text: res.message, success: res.canFit });
    if (Object.keys(res.recommendedSettings).length > 0) {
      onUpdateSettings(res.recommendedSettings);
    }
    setTimeout(() => {
      setFitMessage(null);
    }, 6000);
  };

  return (
    <Card className="border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm mb-6">
      <CardHeader className="py-3 px-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Columns className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          <h2 className="font-extrabold text-sm text-slate-900 dark:text-white">
            تنسيق الصفحة والطباعة (Layout & Print Engine)
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onPrint}
            className="flex items-center gap-1.5 shadow-sm font-bold"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة فورية / PDF</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Smart Fit Optimizer Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-lg bg-brand-50/80 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-900">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-600 dark:text-brand-400 animate-pulse" />
            <span className="text-xs font-bold text-brand-900 dark:text-brand-200">
              الملاءمة الذكية للصفحات (Smart Page Fit):
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleFitPages(1)}
              className="text-xs font-bold border-brand-300 dark:border-brand-700 hover:bg-brand-100 dark:hover:bg-brand-900"
            >
              <Minimize2 className="w-3.5 h-3.5 ml-1" />
              ملاءمة لصفحة واحدة (Fit 1 Page)
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleFitPages(2)}
              className="text-xs font-bold border-brand-300 dark:border-brand-700 hover:bg-brand-100 dark:hover:bg-brand-900"
            >
              <Maximize2 className="w-3.5 h-3.5 ml-1" />
              ملاءمة لصفحتين (Fit 2 Pages)
            </Button>
          </div>
        </div>

        {fitMessage && (
          <div
            className={`p-2.5 rounded text-xs flex items-center gap-2 font-medium ${
              fitMessage.success
                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
                : 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800'
            }`}
          >
            {fitMessage.success ? (
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            )}
            <span>{fitMessage.text}</span>
          </div>
        )}

        {/* Controls Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
          {/* Paper Size */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              حجم الورق
            </label>
            <select
              value={settings.pageSize}
              onChange={(e) => onUpdateSettings({ pageSize: e.target.value as PageSize })}
              className="w-full px-2 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
            >
              <option value="A4">A4 (210 × 297 مم)</option>
              <option value="A3">A3 (297 × 420 مم)</option>
              <option value="Letter">Letter (أمريكي)</option>
            </select>
          </div>

          {/* Orientation */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              اتجاه الورقة
            </label>
            <select
              value={settings.orientation}
              onChange={(e) => onUpdateSettings({ orientation: e.target.value as PageOrientation })}
              className="w-full px-2 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
            >
              <option value="portrait">عمودي (طولي)</option>
              <option value="landscape">أفقي (عرضي)</option>
            </select>
          </div>

          {/* Columns */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              تخطيط الأعمدة
            </label>
            <select
              value={settings.columns}
              onChange={(e) => onUpdateSettings({ columns: parseInt(e.target.value, 10) as 1 | 2 })}
              className="w-full px-2 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
            >
              <option value={1}>عمود واحد (كامل الصفحة)</option>
              <option value={2}>عمودان (مع خط فاصل)</option>
            </select>
          </div>

          {/* Base Font */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              نوع الخط الأساسي
            </label>
            <select
              value={settings.baseFont}
              onChange={(e) => onUpdateSettings({ baseFont: e.target.value as BaseFont })}
              className="w-full px-2 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
            >
              <option value="cairo">القاهرة (Cairo) - افتراضي</option>
              <option value="amiri">الأميري (Amiri) - نسخ كلاسيكي</option>
              <option value="tajawal">تجوال (Tajawal) - هندسي</option>
              <option value="noto">نوتو نسخ (Noto Naskh)</option>
            </select>
          </div>

          {/* Font Size */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              حجم الخط: {settings.fontSizePt}pt
            </label>
            <select
              value={settings.fontSizePt}
              onChange={(e) => onUpdateSettings({ fontSizePt: parseFloat(e.target.value) })}
              className="w-full px-2 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
            >
              <option value={10}>10 pt (مكثف جداً)</option>
              <option value={11}>11 pt (مدمج)</option>
              <option value={12}>12 pt (قياسي)</option>
              <option value={13}>13 pt (متوسط)</option>
              <option value={14}>14 pt (كبير)</option>
              <option value={15}>15 pt (واضح جداً)</option>
            </select>
          </div>

          {/* Line Spacing */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              تباعد الأسطر: {settings.lineSpacing}
            </label>
            <select
              value={settings.lineSpacing}
              onChange={(e) => onUpdateSettings({ lineSpacing: parseFloat(e.target.value) })}
              className="w-full px-2 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
            >
              <option value={1.15}>1.15 (مضغوط)</option>
              <option value={1.3}>1.30 (قياسي امتحاني)</option>
              <option value={1.4}>1.40 (متوازن)</option>
              <option value={1.5}>1.50 (مريح)</option>
              <option value={1.75}>1.75 (واسع)</option>
            </select>
          </div>
        </div>

        {/* Secondary options row */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
          {/* Margins Presets */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 dark:text-slate-300">الهوامش:</span>
            {(['narrow', 'standard', 'wide'] as const).map((preset) => {
              const labels = { narrow: 'ضيقة (8 مم)', standard: 'قياسية (12 مم)', wide: 'عريضة (20 مم)' };
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleMarginPresetChange(preset)}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    settings.marginPreset === preset
                      ? 'bg-brand-600 text-white font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {labels[preset]}
                </button>
              );
            })}
          </div>

          {/* Toggles */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={settings.repeatMiniHeaderOnSubsequentPages}
                onChange={(e) =>
                  onUpdateSettings({ repeatMiniHeaderOnSubsequentPages: e.target.checked })
                }
                className="w-3.5 h-3.5 rounded text-brand-600 focus:ring-brand-500"
              />
              <span>ترويسة مصغرة للصفحات اللاحقة</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={settings.showPageNumbers}
                onChange={(e) => onUpdateSettings({ showPageNumbers: e.target.checked })}
                className="w-3.5 h-3.5 rounded text-brand-600 focus:ring-brand-500"
              />
              <span>ترقيم الصفحات (صفحة X من Y)</span>
            </label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
