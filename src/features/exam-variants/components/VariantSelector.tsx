import React from 'react';
import { Layers, Shuffle } from 'lucide-react';
import type { ExamVariantType } from '../utils/shuffler';

interface VariantSelectorProps {
  activeVariant: ExamVariantType;
  onChangeVariant: (variant: ExamVariantType) => void;
}

export const VariantSelector: React.FC<VariantSelectorProps> = ({
  activeVariant,
  onChangeVariant,
}) => {
  return (
    <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold">
      <div className="flex items-center gap-1 px-2 text-slate-500">
        <Layers className="w-3.5 h-3.5" />
        <span>النموذج:</span>
      </div>

      <button
        type="button"
        onClick={() => onChangeVariant('original')}
        className={`px-2.5 py-1 rounded-md transition-all ${
          activeVariant === 'original'
            ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-white shadow-sm font-extrabold'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
        }`}
      >
        الأصلي
      </button>

      <button
        type="button"
        onClick={() => onChangeVariant('model_a')}
        className={`px-2.5 py-1 rounded-md transition-all ${
          activeVariant === 'model_a'
            ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-white shadow-sm font-extrabold'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
        }`}
      >
        نموذج (أ)
      </button>

      <button
        type="button"
        onClick={() => onChangeVariant('model_b')}
        className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
          activeVariant === 'model_b'
            ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-white shadow-sm font-extrabold'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
        }`}
        title="خلط خيارات الاختيار من متعدد وترتيب الفروع آلياً"
      >
        <Shuffle className="w-3 h-3" />
        <span>نموذج (ب)</span>
      </button>
    </div>
  );
};
