import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  CheckCircle2, 
  Layers, 
  Database, 
  Shield, 
  Sparkles, 
  BookOpen, 
  KeyRound, 
  RefreshCw,
  PlusCircle,
  School
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useSettingsStore } from '@/stores/settingsStore';
import { useAuthStore } from '@/stores/authStore';
import { formatDigits, getAlphabeticalIndex } from '@/lib/arabic-numbers';
import { db } from '@/db';

export function App() {
  const { t } = useTranslation();
  const { digitStyle } = useSettingsStore();
  const { entitlement, initAuth, redeemCode } = useAuthStore();

  const [inputCode, setInputCode] = useState('');
  const [redeemStatus, setRedeemStatus] = useState<{ message: string; isError: boolean } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dexie test state
  const [dexieCount, setDexieCount] = useState<number | null>(null);
  const [dexieStatus, setDexieStatus] = useState<string>('جاري فحص اتصال IndexedDB...');

  useEffect(() => {
    initAuth();
    testDexie();
  }, [initAuth]);

  const testDexie = async () => {
    try {
      const count = await db.schoolProfiles.count();
      setDexieCount(count);
      setDexieStatus('متصل وجاهز للاستخدام بدون قيود تخزين');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setDexieStatus('خطأ في الاتصال بقاعدة البيانات المحلية: ' + msg);
    }
  };

  const handleAddSampleSchool = async () => {
    try {
      const id = 'school-' + Date.now();
      await db.schoolProfiles.put({
        id,
        ministry: 'جمهورية العراق - وزارة التربية',
        directorate: 'المديرية العامة للتربية في محافظة بغداد / الكرخ الأولى',
        schoolName: 'ثانوية المتميزين النموذجية للبنين',
        logoPlacement: 'right',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      await testDexie();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert('فشل حفظ البيانات: ' + msg);
    }
  };

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;

    setIsSubmitting(true);
    setRedeemStatus(null);
    try {
      const res = await redeemCode(inputCode.trim());
      if (res.success) {
        setRedeemStatus({ message: res.message, isError: false });
        setInputCode('');
      } else {
        setRedeemStatus({ message: res.message, isError: true });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'خطأ غير متوقع';
      setRedeemStatus({ message: msg, isError: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-900 via-slate-900 to-slate-950 p-8 sm:p-12 text-white border border-brand-800/40 shadow-xl">
          <div className="absolute -top-24 -end-24 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('phase0.statusBanner')}</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              {t('app.title')} — {t('app.subtitle')}
            </h1>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
              {t('app.description')}
            </p>
          </div>
        </div>

        {/* Phase 0 Architecture Checklist */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-emerald-500/30 bg-emerald-50/30 dark:bg-emerald-950/20">
            <CardContent className="p-5 flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">RTL & العربية أولاً</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  تبديل اتجاه ديناميكي وخطوط عربية أصيلة مدمجة (Cairo, Amiri, Tajawal).
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-brand-500/30 bg-brand-50/30 dark:bg-brand-950/20">
            <CardContent className="p-5 flex items-start gap-3">
              <Database className="w-6 h-6 text-brand-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">IndexedDB (Dexie)</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  تخزين سحابي ومحلي مستقل لا يستهلك حصة LocalStorage للصور والأسئلة.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-indigo-500/30 bg-indigo-50/30 dark:bg-indigo-950/20">
            <CardContent className="p-5 flex items-start gap-3">
              <Shield className="w-6 h-6 text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">أمان Supabase RLS</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  حماية جداول الأكواد والاشتراكات عبر SHA-256 ودوال Postgres المشفرة.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-500/30 bg-amber-50/30 dark:bg-amber-950/20">
            <CardContent className="p-5 flex items-start gap-3">
              <Layers className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">جاهزية العمل دون إنترنت</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  ملف Service Worker و PWA Manifest لتشغيل التطبيق والطباعة بلا شبكة.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Feature Verification Modules */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Module 1: Numerals & Arabic Letter Numbering Engine */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-brand-500" />
                <CardTitle>محرك الأرقام والترقيم العربي</CardTitle>
              </div>
              <Badge variant="primary">
                {digitStyle === 'eastern' ? 'أرقام مشرقية (١٢٣)' : 'أرقام مغربية (123)'}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                يتحكم محرك الترقيم في تحويل أرقام الأسئلة والدرجات تلقائياً دون لمس معادلات الرياضيات (KaTeX)، مجرباً للأرقام المشرقية والمغربية:
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6].map((num, idx) => (
                  <div
                    key={num}
                    className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-center"
                  >
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      السؤال {getAlphabeticalIndex(idx)}
                    </div>
                    <div className="text-lg font-bold text-brand-600 dark:text-brand-400">
                      س {formatDigits(num, digitStyle)}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      ({formatDigits(num * 5, digitStyle)} درجات)
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Module 2: IndexedDB Local Database Test */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <School className="w-5 h-5 text-emerald-500" />
                <CardTitle>قاعدة البيانات المحلية (IndexedDB / Dexie)</CardTitle>
              </div>
              <Button size="sm" variant="outline" onClick={testDexie} title="إعادة فحص">
                <RefreshCw className="w-3.5 h-3.5" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800/50 text-xs font-mono space-y-1">
                <div>حالة الاتصال: <span className="font-bold text-emerald-500">{dexieStatus}</span></div>
                <div>سجلات المدارس المحفوظة محلياً: <span className="font-bold text-brand-500">{dexieCount ?? '...'}</span></div>
              </div>

              <div className="flex items-center gap-3">
                <Button size="sm" variant="primary" onClick={handleAddSampleSchool}>
                  <PlusCircle className="w-4 h-4 me-1.5" />
                  حفظ مدرسة تجريبية في IndexedDB
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Module 3: Supabase Code Redemption & Entitlement */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-500" />
                <CardTitle>تفعيل اشتراك بالرمز (Supabase RPC)</CardTitle>
              </div>
              <Badge variant={entitlement.isActive ? 'success' : 'neutral'}>
                الخطة: {entitlement.plan} {entitlement.isActive ? `(متبقي ${entitlement.daysLeft} يوم)` : ''}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                يتم التحقق من الرمز بالكامل عبر دالة <code className="text-brand-500">redeem_code</code> المشفرة من جانب الخادم في Postgres، مع التحقق من صلاحية الرمز، وحسابات محاولات التخمين (Rate Limiting).
              </p>

              <form onSubmit={handleRedeem} className="flex flex-col sm:flex-row items-center gap-3 max-w-xl">
                <input
                  type="text"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  placeholder={t('subscription.codePlaceholder')}
                  className="w-full sm:w-72 px-4 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-brand-500"
                  maxLength={16}
                />
                <Button type="submit" variant="primary" size="md" isLoading={isSubmitting} className="w-full sm:w-auto">
                  {t('subscription.redeemButton')}
                </Button>
              </form>

              {redeemStatus && (
                <div
                  className={`p-3 rounded-lg text-xs font-semibold ${
                    redeemStatus.isError
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                  }`}
                >
                  {redeemStatus.message}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
