import { useEffect, useState } from 'react';
import { 
  Printer, 
  Save, 
  RotateCcw, 
  School, 
  FileText, 
  CheckCircle2, 
  KeyRound,
  Eye,
  Sliders,
  Sigma,
  Plus,
  BookOpen,
  ListOrdered
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
import { SchoolProfileModal } from '@/features/exam-header/components/SchoolProfileModal';
import { QuestionEditor } from '@/features/editor/components/QuestionEditor';
import { SampleQuestionsViewer } from '@/features/editor/components/SampleQuestionsViewer';
import { QuestionBuilderStudio } from '@/features/questions/components/QuestionBuilderStudio';
import { computeTotalMarks } from '@/features/questions/utils/numbering';
import { formatDigits } from '@/lib/arabic-numbers';
import type { QuestionData } from '@/features/questions/types';
import { LayoutControls } from '@/features/layout/components/LayoutControls';
import { MultiPageExamPreview } from '@/features/layout/components/MultiPageExamPreview';

export function App() {
  const { digitStyle } = useSettingsStore();
  const { entitlement, initAuth, redeemCode } = useAuthStore();
  const { 
    headerData, 
    questions,
    pageSettings,
    updatePageSettings,
    setQuestions,
    addQuestion,
    updateHeaderData, 
    loadDefaultSchoolProfile, 
    saveExamToDatabase, 
    resetToDefault,
    isSaving,
    lastSavedAt 
  } = useExamStore();

  const [activeTab, setActiveTab] = useState<'paper' | 'builder' | 'editor' | 'samples' | 'overview'>('paper');
  const [isSchoolModalOpen, setIsSchoolModalOpen] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  // Editor draft state
  const [draftContent, setDraftContent] = useState<string>('');
  const [draftDirection, setDraftDirection] = useState<'rtl' | 'ltr'>('rtl');
  const [draftMarks, setDraftMarks] = useState<number>(20);

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

  const handleAddNewQuestionFromEditor = () => {
    if (!draftContent || draftContent === '<p>اكتب نص السؤال هنا...</p>') {
      alert('يرجى كتابة نص السؤال أو إدراج معادلة أولاً');
      return;
    }
    const qIndex = questions.length + 1;
    const newQ: QuestionData = {
      id: 'q-' + Date.now(),
      type: 'essay',
      prompt: draftContent,
      marks: draftMarks || 20,
      direction: draftDirection,
      title: `السؤال ${formatDigits(qIndex, digitStyle)}`,
    };
    addQuestion(newQ);
    alert('تمت إضافة السؤال بنجاح إلى ورقة الامتحان!');
    setActiveTab('paper');
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

  const currentTotalMarks = computeTotalMarks(questions);
  const isMarksMismatch = currentTotalMarks !== headerData.totalMarks;

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-cairo">
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
                  المرحلة 4: محرك التخطيط وتوزيع الصفحات والطباعة
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                A4/A3/Letter • عمودان/عمود • هوامش وخطوط • ملاءمة ذكية (Fit to 1/2 Pages) • طباعة فورية
                {lastSavedAt ? ` • تم الحفظ: ${new Date(lastSavedAt).toLocaleTimeString('ar-IQ')}` : ''}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View Switcher Tabs */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('paper')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${
                  activeTab === 'paper'
                    ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>ورقة الامتحان A4 ({questions.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('builder')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${
                  activeTab === 'builder'
                    ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <ListOrdered className="w-3.5 h-3.5" />
                <span>منشئ الأسئلة (7 أنواع)</span>
              </button>

              <button
                onClick={() => setActiveTab('editor')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${
                  activeTab === 'editor'
                    ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Sigma className="w-3.5 h-3.5" />
                <span>محرر المعادلات</span>
              </button>

              <button
                onClick={() => setActiveTab('samples')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${
                  activeTab === 'samples'
                    ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>نماذج جاهزة (30)</span>
              </button>

              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${
                  activeTab === 'overview'
                    ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>إعدادات الترويسة</span>
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
              <span>طباعة A4</span>
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
            <span>تم حفظ الاختبار والأسئلة بنجاح في IndexedDB!</span>
          </div>
        )}

        {/* TAB 1: Real WYSIWYG Multipage Exam Paper with Layout Controls */}
        {activeTab === 'paper' && (
          <div className="flex flex-col items-center space-y-6">
            {/* Live Marks Counter bar */}
            <div className="no-print w-full max-w-5xl flex flex-wrap items-center justify-between gap-3 px-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-600 dark:text-slate-400">مجموع درجات الورقة:</span>
                <span className={`font-extrabold text-sm ${isMarksMismatch ? 'text-amber-500' : 'text-emerald-500'}`}>
                  {formatDigits(currentTotalMarks, digitStyle)} / {formatDigits(headerData.totalMarks, digitStyle)} درجة
                </span>
                {isMarksMismatch && (
                  <span className="text-[11px] text-amber-500 font-semibold">
                    (تنبيه: مجموع درجات الأسئلة يختلف عن المستهدف {formatDigits(headerData.totalMarks, digitStyle)} درجة)
                  </span>
                )}
              </div>
              <span className="text-slate-400 text-[11px]">معاينة حقيقية مطابقة للطباعة بنسبة 100% مع تحكم بالتوزيع والهوامش</span>
            </div>

            {/* Layout Controls Bar (no-print) */}
            <div className="no-print w-full max-w-5xl">
              <LayoutControls
                settings={pageSettings}
                questions={questions}
                header={headerData}
                onUpdateSettings={updatePageSettings}
                onPrint={handlePrint}
              />
            </div>

            {/* Multipage Printable Sheets */}
            <div className="print-area w-full max-w-5xl flex justify-center">
              <MultiPageExamPreview
                questions={questions}
                header={headerData}
                settings={pageSettings}
              />
            </div>
          </div>
        )}

        {/* TAB 2: Question Builder Studio */}
        {activeTab === 'builder' && (
          <div className="no-print space-y-4">
            <QuestionBuilderStudio
              questions={questions}
              targetTotalMarks={headerData.totalMarks}
              digitStyle={digitStyle}
              onQuestionsChange={setQuestions}
            />
          </div>
        )}

        {/* TAB 3: Question Editor & MathLive Toolbar */}
        {activeTab === 'editor' && (
          <div className="no-print space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sigma className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                  <CardTitle className="text-base font-bold">
                    محرر الأسئلة والرموز الرياضية والعلمية
                  </CardTitle>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span>درجة السؤال:</span>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={draftMarks}
                      onChange={(e) => setDraftMarks(parseInt(e.target.value, 10) || 10)}
                      className="w-16 px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-center font-bold"
                    />
                  </label>
                  <Button variant="primary" size="sm" onClick={handleAddNewQuestionFromEditor}>
                    <Plus className="w-4 h-4 me-1.5" />
                    إدراج السؤال في ورقة الامتحان
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  استخدم المحرر لكتابة السؤال، واضغط زر &quot;إدراج معادلة / رمز&quot; لفتح لوحة المعادلات المرئية (كسور، جذور، تكاملات، متجهات، معادلات كيميائية).
                </p>

                <QuestionEditor
                  direction={draftDirection}
                  onDirectionChange={setDraftDirection}
                  onChange={setDraftContent}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 4: 30 Sample Curated Questions */}
        {activeTab === 'samples' && (
          <div className="no-print space-y-4">
            <div className="p-4 rounded-xl bg-brand-50/50 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-800/40">
              <h3 className="text-sm font-bold text-brand-800 dark:text-brand-300 mb-1">
                بنك النماذج العلمية الجاهزة (30 سؤالاً شاملاً)
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                تصفح النماذج المتخصصة في الجبر، التفاضل والتكامل، الميكانيكا، الدوائر الكهربائية، الكيمياء، واللغة الإنجليزية مع معادلاتها وصيغها المنفذة، واضغط &quot;إدراج في ورقة الامتحان&quot; لنقل أي سؤال فوراً.
              </p>
            </div>

            <SampleQuestionsViewer
              digitStyle={digitStyle}
              onInsertQuestion={(q) => {
                const newQ: QuestionData = {
                  id: 'q-' + Date.now() + '-' + q.id,
                  type: 'essay',
                  prompt: q.content,
                  marks: q.marks,
                  direction: q.direction,
                  title: q.title,
                };
                addQuestion(newQ);
              }}
            />
          </div>
        )}

        {/* TAB 5: Header & Institutional Settings */}
        {activeTab === 'overview' && (
          <div className="no-print space-y-6">
            <ExamHeaderEditor
              data={headerData}
              onChange={updateHeaderData}
              onOpenSchoolProfile={() => setIsSchoolModalOpen(true)}
            />

            {/* Supabase Subscription Status & Code Redemption */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-amber-500" />
                  <CardTitle className="text-sm font-bold">تفعيل رمز اشتراك مدفوع (Supabase RPC)</CardTitle>
                </div>
                <Badge variant={entitlement.isActive ? 'primary' : 'neutral'}>
                  الخطة: {entitlement.plan}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-slate-500">
                  أدخل رمز التفعيل الممنوح من إدارة المنصة لتفعيل الميزات المدفوعة:
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
