import { ShieldCheck, HardDrive, Cpu } from 'lucide-react';

export function Footer() {

  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 py-6 mt-12 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700 dark:text-slate-300">ExamForge (اطبعلي)</span>
          <span>•</span>
          <span>نسخة مفتوحة المصدر للمعلمين والمدارس</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5" title="البيانات الحساسة للاختبارات محفوظة محلياً في متصفحك">
            <HardDrive className="w-3.5 h-3.5 text-emerald-500" />
            <span>IndexedDB محفوظ محلياً</span>
          </div>
          <div className="flex items-center gap-1.5" title="قواعد أمان مشددة على جداول الاشتراكات">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-500" />
            <span>Supabase RLS</span>
          </div>
          <div className="flex items-center gap-1.5" title="يعمل دون اتصال كلياً">
            <Cpu className="w-3.5 h-3.5 text-indigo-500" />
            <span>جاهز للعمل دون إنترنت</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
