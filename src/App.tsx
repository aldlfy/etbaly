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
  Trash2,
  BookOpen
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
import { QuestionEditor } from '@/features/editor/components/QuestionEditor';
import { SampleQuestionsViewer } from '@/features/editor/components/SampleQuestionsViewer';
import { renderLatex } from '@/lib/katex';
import { formatDigits } from '@/lib/arabic-numbers';

export function App() {
  const { digitStyle } = useSettingsStore();
  const { entitlement, initAuth, redeemCode } = useAuthStore();
  const { 
    headerData, 
    questions,
    addQuestion,
    removeQuestion,
    updateHeaderData, 
    loadDefaultSchoolProfile, 
    saveExamToDatabase, 
    resetToDefault,
    isSaving,
    lastSavedAt 
  } = useExamStore();

  const [activeTab, setActiveTab] = useState<'paper' | 'editor' | 'samples' | 'overview'>('paper');
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

  const handleAddNewQuestion = () => {
    if (!draftContent || draftContent === '<p>اكتب نص السؤال هنا...</p>') {
      alert('يرجى كتابة نص السؤال أو إدراج معادلة أولاً');
      return;
    }
    const qIndex = questions.length + 1;
    addQuestion({
      title: `السؤال ${formatDigits(qIndex, digitStyle)}`,
      content: draftContent,
      marks: draftMarks || 20,
      direction: draftDirection,
    });
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

  const parseMathInText = (html: string) => {
    return html.replace(/\$([^$]+)\$/g, (_, math) => {
      return renderLatex(math, { displayMode: false });
    });
  };

  const totalCalculatedMarks = questions.reduce((sum, q) => sum + (q.marks || 0), 0);

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
                  المرحلة 2: محرر الرياضيات والرموز العلمية (KaTeX)
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                محرر غني • صيغ رياضيات وفيزياء وكيمياء • 30 نموذجاً علمياً • عزل ثنائي الاتجاه (Bidi)
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
                onClick={() => setActiveTab('editor')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${
                  activeTab === 'editor'
                    ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Sigma className="w-3.5 h-3.5" />
                <span>محرر المعادلات والأسئلة</span>
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
                <span>نماذج أسئلة جاهزة (30)</span>
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

        {/* TAB 1: Real WYSIWYG A4 Exam Paper */}
        {activeTab === 'paper' && (
          <div className="flex flex-col items-center">
            {/* Marks status banner */}
            <div className="no-print w-full max-w-4xl flex items-center justify-between mb-3 px-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-600 dark:text-slate-400">مجموع درجات الأسئلة الحالية:</span>
                <span className={`font-extrabold text-sm ${totalCalculatedMarks !== headerData.totalMarks ? 'text-amber-500' : 'text-emerald-500'}`}>
                  {formatDigits(totalCalculatedMarks, digitStyle)} / {formatDigits(headerData.totalMarks, digitStyle)} درجة
                </span>
                {totalCalculatedMarks !== headerData.totalMarks && (
                  <span className="text-[11px] text-amber-500 font-semibold">
                    (تنبيه: مجموع درجات الأسئلة يختلف عن الدرجة الكلية للامتحان)
                  </span>
                )}
              </div>
              <span className="text-slate-400 text-[11px]">ورقة A4 قياسية جاهزة للطباعة فوراً</span>
            </div>

            {/* A4 Printable Sheet */}
            <div
              className="print-area exam-sheet w-full max-w-4xl bg-white text-black rounded-lg shadow-2xl border border-slate-300 p-6 sm:p-10 min-h-[1123px] flex flex-col justify-between"
              style={{ fontFamily: 'Cairo, sans-serif' }}
            >
              {/* Header & Grading Grid */}
              <div>
                <ExamHeaderPreview data={headerData} digitStyle={digitStyle} />

                {/* Exam Questions Body */}
                <div className="mt-6 space-y-6 text-sm">
                  {questions.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 border border-dashed border-slate-300 rounded-lg no-print">
                      <p className="font-bold mb-1">لا توجد أسئلة مدرجة في الورقة حالياً.</p>
                      <p className="text-xs">
                        انتقل إلى تبويب &quot;محرر المعادلات والأسئلة&quot; أو &quot;نماذج أسئلة جاهزة&quot; لإضافة الأسئلة.
                      </p>
                    </div>
                  ) : (
                    questions.map((q, idx) => (
                      <div
                        key={q.id}
                        className="relative group border-b border-black/30 pb-4 pt-1 break-inside-avoid"
                      >
                        {/* Question Header & Marks */}
                        <div className="flex items-center justify-between font-bold mb-2">
                          <span className="text-sm font-extrabold">
                            س{formatDigits(idx + 1, digitStyle)}:
                          </span>
                          <span className="text-xs font-bold text-black">
                            ({formatDigits(q.marks, digitStyle)} درجات)
                          </span>
                        </div>

                        {/* Question Content with MathLive/KaTeX Render */}
                        <div
                          dir={q.direction}
                          className={`text-xs sm:text-sm leading-relaxed text-black ${
                            q.direction === 'ltr' ? 'text-left font-sans' : 'text-right'
                          }`}
                          dangerouslySetInnerHTML={{ __html: parseMathInText(q.content) }}
                        />

                        {/* Delete Question Action (Hidden in print) */}
                        <button
                          type="button"
                          onClick={() => removeQuestion(q.id)}
                          className="no-print absolute top-1 end-16 text-rose-500 hover:text-rose-700 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-xs flex items-center gap-1 bg-white/90 rounded shadow-xs"
                          title="حذف هذا السؤال من الورقة"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>حذف</span>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Ministerial Footer */}
              <ExamFooter
                data={headerData}
                currentPage={1}
                totalPages={1}
                digitStyle={digitStyle}
              />
            </div>
          </div>
        )}

        {/* TAB 2: Question Editor & MathLive Toolbar */}
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
                  <Button variant="primary" size="sm" onClick={handleAddNewQuestion}>
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

        {/* TAB 3: 30 Sample Curated Questions */}
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
                addQuestion({
                  title: q.title,
                  content: q.content,
                  marks: q.marks,
                  direction: q.direction,
                });
              }}
            />
          </div>
        )}

        {/* TAB 4: Header & Institutional Settings */}
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
