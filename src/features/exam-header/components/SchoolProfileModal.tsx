import { useState, useEffect, type ChangeEvent } from 'react';
import { db } from '@/db';
import type { SchoolProfile, AssetBlob } from '@/db/models';
import type { LogoPlacement } from '../types';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Upload, Trash2, Check, School, Image as ImageIcon, X } from 'lucide-react';

interface SchoolProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProfile: (profile: {
    ministry: string;
    directorate: string;
    schoolName: string;
    logoUrl?: string;
    logoBlobId?: string;
    logoPlacement: LogoPlacement;
  }) => void;
}

export function SchoolProfileModal({ isOpen, onClose, onSelectProfile }: SchoolProfileModalProps) {
  const [profiles, setProfiles] = useState<SchoolProfile[]>([]);
  const [ministry, setMinistry] = useState('جمهورية العراق - وزارة التربية');
  const [directorate, setDirectorate] = useState('المديرية العامة للتربية في محافظة بغداد / الكرخ الأولى');
  const [schoolName, setSchoolName] = useState('ثانوية المتميزين النموذجية للبنين');
  const [logoPlacement, setLogoPlacement] = useState<LogoPlacement>('center');
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | undefined>(undefined);
  const [currentBlobId, setCurrentBlobId] = useState<string | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadSavedProfiles();
    }
  }, [isOpen]);

  const loadSavedProfiles = async () => {
    try {
      const list = await db.schoolProfiles.toArray();
      setProfiles(list);
      if (list.length > 0) {
        const first = list[0];
        setMinistry(first.ministry);
        setDirectorate(first.directorate);
        setSchoolName(first.schoolName);
        setLogoPlacement(first.logoPlacement || 'center');
        if (first.logoBlobId) {
          setCurrentBlobId(first.logoBlobId);
          const blobRecord = await db.assetBlobs.get(first.logoBlobId);
          if (blobRecord) {
            setLogoPreviewUrl(URL.createObjectURL(blobRecord.data));
          }
        }
      }
    } catch (err) {
      console.error('Failed to load school profiles:', err);
    }
  };

  const handleSelectExistingProfile = async (p: SchoolProfile) => {
    setMinistry(p.ministry);
    setDirectorate(p.directorate);
    setSchoolName(p.schoolName);
    setLogoPlacement(p.logoPlacement || 'center');
    if (p.logoBlobId) {
      setCurrentBlobId(p.logoBlobId);
      const blobRecord = await db.assetBlobs.get(p.logoBlobId);
      if (blobRecord) {
        setLogoPreviewUrl(URL.createObjectURL(blobRecord.data));
      } else {
        setLogoPreviewUrl(undefined);
      }
    } else {
      setCurrentBlobId(undefined);
      setLogoPreviewUrl(undefined);
    }
  };

  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('حجم الصورة يجب ألا يتجاوز 2 ميغابايت');
      return;
    }

    const preview = URL.createObjectURL(file);
    setLogoPreviewUrl(preview);

    // Save directly to Dexie AssetBlob
    const reader = new FileReader();
    reader.onload = async () => {
      const blob = new Blob([reader.result as ArrayBuffer], { type: file.type });
      const blobId = 'logo-' + Date.now();
      const assetBlob: AssetBlob = {
        id: blobId,
        name: file.name,
        mimeType: file.type,
        data: blob,
        createdAt: Date.now(),
      };
      await db.assetBlobs.put(assetBlob);
      setCurrentBlobId(blobId);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleRemoveLogo = async () => {
    if (currentBlobId) {
      await db.assetBlobs.delete(currentBlobId);
    }
    setLogoPreviewUrl(undefined);
    setCurrentBlobId(undefined);
  };

  const handleSaveAndApply = async () => {
    if (!schoolName.trim()) {
      alert('يرجى إدخال اسم المدرسة');
      return;
    }

    setIsSaving(true);
    try {
      const profileId = 'profile-default';
      const record: SchoolProfile = {
        id: profileId,
        ministry: ministry.trim(),
        directorate: directorate.trim(),
        schoolName: schoolName.trim(),
        logoBlobId: currentBlobId,
        logoPlacement,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      await db.schoolProfiles.put(record);

      onSelectProfile({
        ministry: record.ministry,
        directorate: record.directorate,
        schoolName: record.schoolName,
        logoBlobId: currentBlobId,
        logoUrl: logoPreviewUrl,
        logoPlacement,
      });

      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert('فشل حفظ الملف التعريفي: ' + msg);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <Card className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <School className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <CardTitle>الملف التعريفي للمدرسة (محفوظ محلياً)</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="p-1">
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-4 pt-2">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            يتم حفظ هذه البيانات في متصفحك داخل IndexedDB لإعادة استخدامها في كافة الامتحانات تلقائياً دون الحاجة لإعادة إدخالها.
          </p>

          {profiles.length > 0 && (
            <div className="p-2.5 rounded-lg bg-brand-50/50 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-800/40 space-y-1.5">
              <label className="block text-[11px] font-bold text-brand-800 dark:text-brand-300">
                المدارس المحفوظة في متصفحك:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {profiles.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectExistingProfile(p)}
                    className="px-2.5 py-1 text-xs font-semibold rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-brand-500 text-slate-800 dark:text-slate-200 shadow-sm"
                  >
                    {p.schoolName}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                الجهة العليا / الوزارة:
              </label>
              <input
                type="text"
                value={ministry}
                onChange={(e) => setMinistry(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                المديرية العامة للتربية:
              </label>
              <input
                type="text"
                value={directorate}
                onChange={(e) => setDirectorate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                اسم المدرسة / الثانوية / الإعدادية:
              </label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 font-bold"
              />
            </div>

            {/* Logo Upload Section */}
            <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 space-y-3">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                شعار المدرسة (يخزن محلياً كـ Blob):
              </label>
              <div className="flex items-center gap-4">
                {logoPreviewUrl ? (
                  <div className="relative w-16 h-16 rounded-lg border border-slate-300 dark:border-slate-600 p-1 bg-white">
                    <img src={logoPreviewUrl} alt="Logo" className="w-full h-full object-contain" />
                    <button
                      onClick={handleRemoveLogo}
                      className="absolute -top-2 -end-2 w-5 h-5 bg-rose-600 text-white rounded-full flex items-center justify-center shadow-md hover:bg-rose-700"
                      title="حذف الشعار"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-lg border border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 bg-slate-100 dark:bg-slate-800">
                    <ImageIcon className="w-6 h-6" />
                    <span className="text-[9px]">لا يوجد</span>
                  </div>
                )}

                <div className="flex-1 space-y-1">
                  <label className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm">
                    <Upload className="w-4 h-4 text-brand-500" />
                    <span>رفع صورة الشعار</span>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>
                  <p className="text-[10px] text-slate-400">PNG, JPG أو SVG (بحد أقصى 2MB)</p>
                </div>
              </div>

              {/* Logo Placement */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  موضع الشعار في الترويسة:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['right', 'center', 'left'] as LogoPlacement[]).map((pos) => (
                    <button
                      key={pos}
                      type="button"
                      onClick={() => setLogoPlacement(pos)}
                      className={`py-1.5 px-3 text-xs font-semibold rounded-lg border transition-all ${
                        logoPlacement === pos
                          ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {pos === 'right' ? 'اليمين' : pos === 'center' ? 'الوسط' : 'اليسار'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={onClose}>
              إلغاء
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveAndApply} isLoading={isSaving}>
              <Check className="w-4 h-4 me-1.5" />
              حفظ وتطبيق
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
