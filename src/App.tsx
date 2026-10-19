import { useEffect, useState } from 'react';
import { 
  Sparkles, 
  Printer, 
  Save, 
  RotateCcw, 
  School, 
  FileText, 
  CheckCircle2, 
  KeyRound,
  Eye,
  Sliders
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useSettingsStore } from '@/stores/settingsStore';
import { useAuthStore } from '@/stores/authStore';
import { useExamStore } from '@/stores/examStore';
import { ExamHeaderEditor } from '@/features/exam-header/components/ExamHeaderEditor';
import { ExamHeaderPreview } from '@/features/exam-header/components/ExamHeaderPreview';
import { ExamFooter } from '@/features/exam-header/components/ExamFooter';
import { SchoolProfileModal } from '@/features/exam-header/components/SchoolProfileModal';
import { formatDigits } from '@/lib/arabic-numbers';

export function App() {
  const { digitStyle } = useSettingsStore();
  const { entitlement, initAuth, redeemCode } = useAuthStore();
  const { 
    headerData, 
    updateHeaderData, 
    loadDefaultSchoolProfile, 
    saveExamToDatabase, 
    resetToDefault,
    isSaving,
    lastSavedAt 
  } = useExamStore();

  const [activeTab, setActiveTab] = useState<'editor' | 'overview'>('editor');
  const [isSchoolModalOpen, setIsSchoolModalOpen] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  // Supabase Code Redemption state
  const [inputCode, setInputCode] = useState('');
  const [redeemStatus, setRedeemStatus] = useState<{ message: string; isError: boolean } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    initAuth();
    loadDefaultSchoolProfile();
  }, [initAuth, loadDefaultSchoolProfile]);

  const handlePrint = () => {
    window.print();
  };

  const handleSaveExam = async () => {
    await saveExamToDatabase();
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
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
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Top Control Bar / Toolbar */}
        <div className="no-print flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base sm:text-lg">
                  {headerData.subject || 'اختبار جديد'} ({headerData.grade})
                </h1>
                <Badge variant="primary" className="text-[11px]">
                  المرحلة 1: ترويسة وبيانات الامتحان
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                طراز وزاري عراقي معتمد • حفظ دائم في IndexedDB • معاينة مطابقة 100% للطباعة
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View Switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('editor')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${
                  activeTab === 'editor'
                    ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>محرر الترويسة والورقة</span>
              </button>
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${
                  activeTab === 'overview'
                    ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>البنية التحتية والاشتراك</span>
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSchoolModalOpen(true)}
              title="تعديل الشعار وبيانات المدرسة"
            >
              <School className="w-4 h-4 me-1 text-brand-500" />
              <span>المدرسة</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveExam}
              isLoading={isSaving}
              title="حفظ الاختبار محلياً في IndexedDB"
            >
              <Save className="w-4 h-4 me-1 text-emerald-500" />
              <span>حفظ</span>
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handlePrint}
              title="طباعة ورقة الامتحان أو حفظها PDF"
            >
              <Printer className="w-4 h-4 me-1" />
              <span>طباعة ورقة الامتحان</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={resetToDefault}
              title="استعادة الإعدادات الافتراضية"
              className="p-2"
            >
              <RotateCcw className="w-4 h-4 text-slate-500" />
            </Button>
          </div>
        </div>

        {/* Save confirmation toast */}
        {saveToast && (
          <div className="no-print p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>تم حفظ بيانات الاختبار وترويسته بنجاح في IndexedDB!</span>
          </div>
        )}

        {/* Tab 1: Editor & WYSIWYG A4 Preview */}
        {activeTab === 'editor' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Editor Sidebar Controls (Hidden on print) */}
            <div className="no-print lg:col-span-5 space-y-4">
              <ExamHeaderEditor
                data={headerData}
                onChange={updateHeaderData}
                onOpenSchoolProfile={() => setIsSchoolModalOpen(true)}
              />

              {lastSavedAt && (
                <p className="text-[11px] text-slate-400 text-center font-mono">
                  آخر حفظ محلي: {new Date(lastSavedAt).toLocaleTimeString('ar-IQ')}
                </p>
              )}
            </div>

            {/* A4 Paper Preview Container */}
            <div className="lg:col-span-7 flex flex-col items-center">
              <div className="no-print w-full flex items-center justify-between mb-2 px-1 text-xs text-slate-500 font-semibold">
                <span className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-brand-500" />
                  معاينة ورقة الامتحان (A4 حقيقي):
                </span>
                <span>مطابقة 100% للشاشة وأمر الطباعة</span>
              </div>

              {/* A4 Paper Canvas */}
              <div
                className="print-area exam-sheet w-full bg-white text-black rounded-lg shadow-xl border border-slate-300 p-6 sm:p-8 min-h-[842px] flex flex-col justify-between"
                style={{
                  fontFamily: 'Cairo, sans-serif',
                }}
              >
                {/* 1. Ministerial Header & Grading Grid */}
                <div>
                  <ExamHeaderPreview data={headerData} digitStyle={digitStyle} />

                  {/* Sample Questions Body Preview for Phase 1 */}
                  <div className="mt-8 space-y-6 text-sm">
                    {/* Q1 Example */}
                    <div className="border-b border-black/20 pb-4">
                      <div className="flex items-center justify-between font-bold mb-2">
                        <span>س{formatDigits(1, digitStyle)}: أجب عما يأتي:</span>
                        <span className="font-extrabold text-xs">({formatDigits(20, digitStyle)} درجة)</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed ps-4">
                        (أ) عرّف ما يأتي باختصار واذكر أهم الخصائص الأساسية لكل منها.
                      </p>
                      <p className="text-xs text-slate-700 leading-relaxed ps-4 mt-2">
                        (ب) علّل لما يأتي معززاً إجابتك بالمعادلات الرياضية أو العلمية المناسبة إن وجدت.
                      </p>
                    </div>

                    {/* Q2 Example */}
                    <div className="border-b border-black/20 pb-4">
                      <div className="flex items-center justify-between font-bold mb-2">
                        <span>س{formatDigits(2, digitStyle)}: اختر الإجابة الصحيحة من بين الأقواس:</span>
                        <span className="font-extrabold text-xs">({formatDigits(20, digitStyle)} درجة)</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed ps-4">
                        ١- تكون محصلة متجهين متعامدين متساويين في المقدار مساوية لـ: [ ٢ | جذر ٢ | صفر ].
                      </p>
                    </div>

                    <div className="p-4 rounded border border-dashed border-slate-300 text-center text-xs text-slate-400 no-print">
                      مساحة أسئلة الامتحان (سيتم تفعيل محرر الرياضيات Tiptap + KaTeX وصانع الأسئلة المتعدد في المرحلتين 2 و 3)
                    </div>
                  </div>
                </div>

                {/* 2. Ministerial Footer with Page Numbers & Good Luck note */}
                <ExamFooter
                  data={headerData}
                  currentPage={1}
                  totalPages={1}
                  digitStyle={digitStyle}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Phase 0 Infrastructure & Subscription Tools */}
        {activeTab === 'overview' && (
          <div className="no-print space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">تخزين IndexedDB المحلي</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <p className="text-slate-500">
                    يعمل المحرر محلياً 100%. جميع الاختبارات والشعارات تخزن في متصفحك دون إرسال إلى أي خادم خارجي.
                  </p>
                  <Badge variant="success">متصل - Dexie 4.x</Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">حالة اشتراك Supabase</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <p className="text-slate-500">
                    الخطة الحالية: <span className="font-bold text-brand-500">{entitlement.plan}</span>
                  </p>
                  <Badge variant={entitlement.isActive ? 'primary' : 'neutral'}>
                    {entitlement.isActive ? `نشط (${entitlement.daysLeft} يوم)` : 'الخطة المجانية'}
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">دعم التثبيت والعمل دون إنترنت</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <p className="text-slate-500">
                    يمكن تثبيت ExamForge كتطبيق مكتبي مستقل على حاسوب المدرسة واستخدامه وطباعة الاختبارات دون أي شبكة.
                  </p>
                  <Badge variant="success">PWA & Service Worker مفعل</Badge>
                </CardContent>
              </Card>
            </div>

            {/* Supabase Code Redemption */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-amber-500" />
                  <CardTitle>تفعيل رمز اشتراك مدفوع (Supabase RPC)</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-slate-500">
                  أدخل رمز التفعيل الممنوح من إدارة المنصة لتفعيل الميزات المدفوعة بصورة مشفرة ومؤمنة تماماً:
                </p>
                <form onSubmit={handleRedeem} className="flex flex-col sm:flex-row items-center gap-3 max-w-md">
                  <input
                    type="text"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                    placeholder="XXXX-XXXX-XXXX"
                    className="w-full sm:w-72 px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono tracking-wider"
                    maxLength={16}
                  />
                  <Button type="submit" variant="primary" size="md" isLoading={isSubmitting}>
                    تفعيل الرمز
                  </Button>
                </form>

                {redeemStatus && (
                  <div
                    className={`p-3 rounded-lg text-xs font-semibold ${
                      redeemStatus.isError
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    }`}
                  >
                    {redeemStatus.message}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <Footer />

      {/* School Profile Modal */}
      <SchoolProfileModal
        isOpen={isSchoolModalOpen}
        onClose={() => setIsSchoolModalOpen(false)}
        onSelectProfile={(profile) => {
          updateHeaderData({
            ministry: profile.ministry,
            directorate: profile.directorate,
            schoolName: profile.schoolName,
            logoUrl: profile.logoUrl,
            logoBlobId: profile.logoBlobId,
            logoPlacement: profile.logoPlacement,
          });
        }}
      />
    </div>
  );
}
