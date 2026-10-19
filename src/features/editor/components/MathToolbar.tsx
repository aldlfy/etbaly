import { useState } from 'react';
import { 
  ALGEBRA_PALETTE, 
  CALCULUS_PALETTE, 
  PHYSICS_PALETTE, 
  CHEMISTRY_PALETTE, 
  MATRIX_PALETTE, 
  GREEK_PALETTE,
  type MathSymbolItem 
} from '../types';
import { renderLatex } from '@/lib/katex';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Sigma, Code2, Plus, Sparkles, X } from 'lucide-react';

interface MathToolbarProps {
  onInsertLatex: (latex: string, isBlock?: boolean) => void;
  onClose?: () => void;
}

type PaletteTab = 'algebra' | 'calculus' | 'physics' | 'chemistry' | 'matrices' | 'greek' | 'custom';

export function MathToolbar({ onInsertLatex, onClose }: MathToolbarProps) {
  const [activeTab, setActiveTab] = useState<PaletteTab>('algebra');
  const [customLatex, setCustomLatex] = useState('\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}');
  const [isBlockMode, setIsBlockMode] = useState(false);

  const getActivePalette = (): MathSymbolItem[] => {
    switch (activeTab) {
      case 'algebra': return ALGEBRA_PALETTE;
      case 'calculus': return CALCULUS_PALETTE;
      case 'physics': return PHYSICS_PALETTE;
      case 'chemistry': return CHEMISTRY_PALETTE;
      case 'matrices': return MATRIX_PALETTE;
      case 'greek': return GREEK_PALETTE;
      default: return [];
    }
  };

  const handleInsert = (latex: string) => {
    onInsertLatex(latex, isBlockMode);
  };

  return (
    <Card className="w-full border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
            <Sigma className="w-4 h-4" />
          </div>
          <CardTitle className="text-sm font-bold">لوحة المعادلات والرموز العلمية المرئية</CardTitle>
        </div>

        <div className="flex items-center gap-2">
          {/* Block vs Inline Math toggle */}
          <button
            type="button"
            onClick={() => setIsBlockMode(!isBlockMode)}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md border transition-all ${
              isBlockMode
                ? 'bg-brand-600 text-white border-brand-600'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
            }`}
          >
            {isBlockMode ? 'معادلة في سطر مستقل (Block)' : 'معادلة مدمجة بالنص (Inline)'}
          </button>

          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose} className="p-1">
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Palette Category Selector Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2">
          {[
            { id: 'algebra', label: 'الجبر والحساب' },
            { id: 'calculus', label: 'التفاضل والتكامل' },
            { id: 'physics', label: 'الفيزياء والوحدات' },
            { id: 'chemistry', label: 'الكيمياء والتفاعلات' },
            { id: 'matrices', label: 'المصفوفات' },
            { id: 'greek', label: 'الرموز الإغريقية' },
            { id: 'custom', label: 'محرر LaTeX الحر' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as PaletteTab)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-300 border border-brand-300 dark:border-brand-800 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Visual Symbol Palette Grid */}
        {activeTab !== 'custom' ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {getActivePalette().map((sym) => {
              const previewHtml = renderLatex(sym.latex, { displayMode: false });
              return (
                <button
                  key={sym.id}
                  type="button"
                  onClick={() => handleInsert(sym.latex)}
                  title={`${sym.tooltip} (${sym.latex})`}
                  className="flex flex-col items-center justify-center p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-brand-500 hover:bg-brand-50/40 dark:hover:bg-brand-950/30 transition-all text-slate-800 dark:text-slate-200 group relative"
                >
                  <div
                    className="min-h-[28px] flex items-center justify-center text-sm font-serif"
                    dangerouslySetInnerHTML={{ __html: previewHtml }}
                  />
                  <span className="text-[10px] text-slate-400 group-hover:text-brand-600 dark:group-hover:text-brand-400 mt-1 truncate max-w-full">
                    {sym.label}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          /* Advanced Raw LaTeX Mode with Live KaTeX Preview */
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
              <Code2 className="w-4 h-4 text-brand-500" />
              <span>اكتب أو ألصق كود LaTeX الرياضي مباشرة لمعاينته فورياً:</span>
            </div>

            <textarea
              rows={3}
              value={customLatex}
              onChange={(e) => setCustomLatex(e.target.value)}
              className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500"
              placeholder="e.g. \int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2}"
            />

            {/* Live KaTeX Render Preview */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex flex-col items-center justify-center min-h-[64px]">
              <span className="text-[10px] text-slate-400 font-mono mb-1 self-start">المعاينة الحية:</span>
              <div
                className="text-base text-slate-900 dark:text-slate-100"
                dangerouslySetInnerHTML={{
                  __html: renderLatex(customLatex || '...', { displayMode: isBlockMode }),
                }}
              />
            </div>

            <div className="flex justify-end">
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleInsert(customLatex)}
                disabled={!customLatex.trim()}
              >
                <Plus className="w-4 h-4 me-1.5" />
                إدراج في نص السؤال
              </Button>
            </div>
          </div>
        )}

        {/* Quick Instructions Hint */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-2 rounded-lg">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>
            لا حاجة لكتابة أكواد LaTeX يدوياً! انقر على أي رمز لإدراجه كمعادلة رياضيات أو فيزياء أو كيمياء منسقة بدقة طباعية عالية.
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
