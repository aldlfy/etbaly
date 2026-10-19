import React, { useState, useEffect } from 'react';
import { 
  KeyRound, 
  ShieldCheck, 
  User, 
  LogOut, 
  LogIn, 
  Copy, 
  Download, 
  Sparkles, 
  X, 
  Check, 
  AlertTriangle,
  Users,
  CreditCard,
  Hash
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import type { AdminStats } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatActivationCode, isValidActivationCodeFormat, exportCodesToCsv } from '../utils/codeValidator';
import { triggerDownload } from '@/features/storage/utils/examJson';
import { formatDigits } from '@/lib/arabic-numbers';
import type { DigitStyle } from '@/features/layout/types';

interface AccountSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  digitStyle?: DigitStyle;
}

export const AccountSubscriptionModal: React.FC<AccountSubscriptionModalProps> = ({
  isOpen,
  onClose,
  digitStyle = 'eastern',
}) => {
  const { 
    user, 
    role, 
    entitlement, 
    redeemCode, 
    signInWithEmail, 
    signUpWithEmail, 
    signOut,
    adminGenerateCodes,
    adminRevokeCode,
    adminGetStats 
  } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'user' | 'admin'>('user');

  // User tab states
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const [codeInputValue, setCodeInputValue] = useState('');
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [redeemResult, setRedeemResult] = useState<{ success: boolean; message: string } | null>(null);

  // Admin tab states
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [planOption, setPlanOption] = useState('pro');
  const [durationOption, setDurationOption] = useState<number>(30);
  const [batchCountOption, setBatchCountOption] = useState<number>(5);
  const [noteOption, setNoteOption] = useState('');
  const [generating, setGenerating] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [generatedCodes, setGeneratedCodes] = useState<any[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const [revokePrefix, setRevokePrefix] = useState('');
  const [revokeReason, setRevokeReason] = useState('إلغاء اشتراك بطلب من المشترك');
  const [revokeStatus, setRevokeStatus] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && activeTab === 'admin') {
      adminGetStats().then((res) => {
        if (res.success && res.stats) {
          setStats(res.stats);
        }
      });
    }
  }, [isOpen, activeTab, adminGetStats]);

  if (!isOpen) return null;

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      if (authMode === 'login') {
        const res = await signInWithEmail(emailInput.trim(), passwordInput);
        if (!res.success) setAuthError(res.error || 'فشل تسجيل الدخول.');
      } else {
        const res = await signUpWithEmail(emailInput.trim(), passwordInput);
        if (!res.success) setAuthError(res.error || 'فشل إنشاء الحساب.');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    const formatted = formatActivationCode(codeInputValue);
    if (!isValidActivationCodeFormat(formatted)) {
      setRedeemResult({
        success: false,
        message: 'صيغة الرمز غير صالحة. يجب أن يتكون من 12 حرفاً ورقمًا (XXXX-XXXX-XXXX).',
      });
      return;
    }

    setRedeemLoading(true);
    setRedeemResult(null);
    try {
      const res = await redeemCode(formatted);
      setRedeemResult({ success: res.success, message: res.message });
      if (res.success) {
        setCodeInputValue('');
      }
    } finally {
      setRedeemLoading(false);
    }
  };

  const handleGenerateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const res = await adminGenerateCodes(planOption, durationOption, batchCountOption, noteOption);
      if (res.success && res.codes) {
        setGeneratedCodes(res.codes);
        // Refresh stats
        const sRes = await adminGetStats();
        if (sRes.success && sRes.stats) setStats(sRes.stats);
      } else {
        alert(res.error || 'فشل توليد الرموز.');
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleExportCsv = () => {
    if (generatedCodes.length === 0) return;
    const csv = exportCodesToCsv(generatedCodes);
    triggerDownload(csv, `ExamForge_Codes_Batch_${Date.now()}.csv`, 'text/csv');
  };

  const handleRevoke = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revokePrefix.trim()) return;
    setRevokeStatus(null);
    const res = await adminRevokeCode(revokePrefix.trim(), revokeReason);
    if (res.success) {
      setRevokeStatus('تم إبطال الرمز بنجاح.');
      setRevokePrefix('');
    } else {
      setRevokeStatus(`خطأ: ${res.error}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-cairo">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[88vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                إدارة الحساب والاشتراك المدفوع (Supabase Auth & RPC)
              </h2>
              <p className="text-xs text-slate-500">
                تفعيل الرموز، متابعة صلاحية الاشتراك، ولوحة تحكم المشرف لإصدار الرموز
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="px-6 py-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('user')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'user'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>حسابي والاشتراك</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('admin')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'admin'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>لوحة المشرف (إصدار الرموز)</span>
            {role === 'admin' && (
              <span className="px-1 py-0.2 rounded bg-amber-200 text-amber-900 text-[10px] font-extrabold">
                Admin
              </span>
            )}
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* TAB 1: User Profile & Subscription */}
          {activeTab === 'user' && (
            <div className="space-y-6">
              {/* Account Status Card */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-600 flex items-center justify-center font-extrabold text-base">
                    {user?.email ? user.email.charAt(0).toUpperCase() : <User className="w-6 h-6" />}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {user?.email || 'مستخدم غير مسجل (جلسة محلية)'}
                    </h4>
                    <p className="text-slate-500 text-xs mt-0.5">
                      الدور: {role === 'admin' ? 'مشرف المنصة (Administrator)' : 'مدرس (Teacher)'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={entitlement.isActive ? 'primary' : 'neutral'} className="text-xs px-2.5 py-1">
                    الخطة: {entitlement.plan === 'pro' ? 'برو (Pro) مفعل' : 'الخطة المجانية'}
                  </Badge>

                  {user ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={signOut}
                      className="text-xs text-rose-600 hover:bg-rose-50"
                    >
                      <LogOut className="w-3.5 h-3.5 ml-1" />
                      تسجيل الخروج
                    </Button>
                  ) : null}
                </div>
              </div>

              {/* Entitlement Details Box */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800">
                  <span className="text-slate-500 font-bold block mb-1">حالة الاشتراك:</span>
                  <span
                    className={`font-extrabold text-sm ${
                      entitlement.isActive ? 'text-emerald-600' : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {entitlement.isActive ? 'نشط ومفعّل ✓' : 'غير مفعّل (مجاني)'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800">
                  <span className="text-slate-500 font-bold block mb-1">الأيام المتبقية:</span>
                  <span className="font-extrabold text-sm text-brand-600 dark:text-brand-400">
                    {formatDigits(entitlement.daysLeft, digitStyle)} يوماً
                  </span>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800">
                  <span className="text-slate-500 font-bold block mb-1">تاريخ الانتهاء:</span>
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                    {entitlement.endsAt
                      ? new Date(entitlement.endsAt).toLocaleDateString('ar-IQ')
                      : 'لا ينطبق (خطة مجانية)'}
                  </span>
                </div>
              </div>

              {/* Code Redemption Box */}
              <div className="p-5 rounded-2xl border-2 border-brand-500/20 bg-brand-50/30 dark:bg-brand-950/20 space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    تفعيل رمز اشتراك مدفوع (Redeem Activation Code)
                  </h4>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                  أدخل رمز التفعيل المكون من 12 خانة مقسمة (XXXX-XXXX-XXXX) لتمديد أو تفعيل اشتراكك:
                </p>

                <form onSubmit={handleRedeem} className="flex flex-col sm:flex-row items-center gap-3">
                  <input
                    type="text"
                    value={codeInputValue}
                    onChange={(e) => setCodeInputValue(formatActivationCode(e.target.value))}
                    placeholder="XXXX-XXXX-XXXX"
                    maxLength={14}
                    className="w-full sm:w-72 px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono tracking-widest text-center font-bold"
                  />
                  <Button type="submit" variant="primary" size="md" isLoading={redeemLoading}>
                    تفعيل الرمز الآن
                  </Button>
                </form>

                {redeemResult && (
                  <div
                    className={`p-3 rounded-lg text-xs font-bold flex items-center gap-2 ${
                      redeemResult.success
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                    }`}
                  >
                    {redeemResult.success ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                    <span>{redeemResult.message}</span>
                  </div>
                )}
              </div>

              {/* Sign In / Sign Up Section (if not logged in) */}
              {!user && (
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <LogIn className="w-4 h-4 text-brand-500" />
                      {authMode === 'login' ? 'تسجيل الدخول إلى حسابك' : 'إنشاء حساب جديد'}
                    </h4>

                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode((m) => (m === 'login' ? 'signup' : 'login'));
                        setAuthError(null);
                      }}
                      className="text-xs text-brand-600 hover:underline font-bold"
                    >
                      {authMode === 'login' ? 'ليس لديك حساب؟ أنشئ حساباً' : 'لديك حساب بالفعل؟ سجل دخولك'}
                    </button>
                  </div>

                  <form onSubmit={handleAuthSubmit} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                          البريد الإلكتروني
                        </label>
                        <input
                          type="email"
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          required
                          placeholder="teacher@example.com"
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                          كلمة المرور
                        </label>
                        <input
                          type="password"
                          value={passwordInput}
                          onChange={(e) => setPasswordInput(e.target.value)}
                          required
                          placeholder="••••••••"
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                        />
                      </div>
                    </div>

                    {authError && (
                      <div className="p-2.5 rounded-lg bg-rose-50 text-rose-800 text-xs font-semibold">
                        {authError}
                      </div>
                    )}

                    <Button type="submit" variant="primary" size="md" isLoading={authLoading}>
                      {authMode === 'login' ? 'تسجيل الدخول' : 'إنشاء الحساب'}
                    </Button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Admin Dashboard */}
          {activeTab === 'admin' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 font-bold block">المشتركون النشطون</span>
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {formatDigits(stats?.active_subscriptions || 0, digitStyle)}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-brand-500/10 text-brand-600">
                    <Hash className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 font-bold block">إجمالي الرموز</span>
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {formatDigits(stats?.total_codes || 0, digitStyle)}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 font-bold block">الرموز المفعلة</span>
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {formatDigits(stats?.total_redemptions || 0, digitStyle)}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 font-bold block">إجمالي الحسابات</span>
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {formatDigits(stats?.total_users || 0, digitStyle)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Batch Code Generator Box */}
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 space-y-4">
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  توليد دفعة رموز تفعيل جديدة (Batch Activation Codes)
                </h4>

                <form onSubmit={handleGenerateBatch} className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        الخطة
                      </label>
                      <select
                        value={planOption}
                        onChange={(e) => setPlanOption(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium"
                      >
                        <option value="pro">برو (Pro)</option>
                        <option value="school">مدرسة (School)</option>
                        <option value="lifetime">مدى الحياة (Lifetime)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        المدة بالأيام
                      </label>
                      <select
                        value={durationOption}
                        onChange={(e) => setDurationOption(parseInt(e.target.value, 10))}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium"
                      >
                        <option value={30}>30 يوماً (شهر)</option>
                        <option value={90}>90 يوماً (فصل)</option>
                        <option value={180}>180 يوماً (كورس)</option>
                        <option value={365}>365 يوماً (سنة)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        عدد الرموز
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={batchCountOption}
                        onChange={(e) => setBatchCountOption(parseInt(e.target.value, 10) || 1)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        ملاحظة / الفئة
                      </label>
                      <input
                        type="text"
                        value={noteOption}
                        onChange={(e) => setNoteOption(e.target.value)}
                        placeholder="مثال: مدرسة الكرخ الأولى"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium"
                      />
                    </div>
                  </div>

                  <Button type="submit" variant="primary" size="md" isLoading={generating}>
                    توليد الرموز المشفرة في Supabase
                  </Button>
                </form>

                {/* Generated Codes Table */}
                {generatedCodes.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-emerald-600">
                        تم توليد {generatedCodes.length} رمزاً بنجاح (احفظها الآن، فالنظام لا يخزنها إلا بصيغة SHA-256):
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleExportCsv}
                        className="text-xs font-bold"
                      >
                        <Download className="w-3.5 h-3.5 ml-1" />
                        تصدير كملف CSV
                      </Button>
                    </div>

                    <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
                      <table className="w-full text-xs text-right">
                        <thead className="bg-slate-100 dark:bg-slate-900 font-bold">
                          <tr>
                            <th className="p-2 border-b border-slate-200">الرمز السري</th>
                            <th className="p-2 border-b border-slate-200">الخطة</th>
                            <th className="p-2 border-b border-slate-200">المدة</th>
                            <th className="p-2 border-b border-slate-200">نسخ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {generatedCodes.map((item, idx) => (
                            <tr key={idx} className="border-b border-slate-100 dark:border-slate-800">
                              <td className="p-2 font-mono font-bold text-brand-600 tracking-wider">
                                {item.code}
                              </td>
                              <td className="p-2">{item.plan}</td>
                              <td className="p-2">{item.duration_days} يوماً</td>
                              <td className="p-2">
                                <button
                                  type="button"
                                  onClick={() => handleCopyCode(item.code, idx)}
                                  className="p-1 rounded text-slate-500 hover:text-slate-800"
                                  title="نسخ الرمز"
                                >
                                  {copiedIndex === idx ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Code Revocation Box */}
              <div className="p-5 rounded-2xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/20 dark:bg-rose-950/20 space-y-3">
                <h4 className="font-extrabold text-sm text-rose-800 dark:text-rose-300">
                  إبطال رمز اشتراك (Revoke Code)
                </h4>
                <p className="text-slate-600 dark:text-slate-400 text-xs">
                  أدخل بادئة الرمز المراد إبطاله (مثال: XXXX-****-****):
                </p>

                <form onSubmit={handleRevoke} className="flex flex-col sm:flex-row items-center gap-3">
                  <input
                    type="text"
                    value={revokePrefix}
                    onChange={(e) => setRevokePrefix(e.target.value.toUpperCase())}
                    placeholder="XXXX-****-****"
                    className="w-full sm:w-60 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-xs font-bold"
                  />
                  <input
                    type="text"
                    value={revokeReason}
                    onChange={(e) => setRevokeReason(e.target.value)}
                    placeholder="سبب الإبطال"
                    className="w-full sm:w-60 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                  <Button type="submit" variant="outline" size="sm" className="text-rose-600 hover:bg-rose-50">
                    إبطال الرمز
                  </Button>
                </form>

                {revokeStatus && (
                  <p className="text-xs font-bold text-rose-700 dark:text-rose-300">
                    {revokeStatus}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
