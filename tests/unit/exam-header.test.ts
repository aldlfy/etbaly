import { describe, it, expect } from 'vitest';
import { DEFAULT_EXAM_HEADER, EXAM_TYPE_LABELS } from '@/features/exam-header/types';
import { db } from '@/db';
import type { SchoolProfile } from '@/db/models';
import { formatDigits } from '@/lib/arabic-numbers';

describe('Phase 1 - Exam Metadata & Header Suite', () => {
  it('provides complete authentic default Iraqi exam header data', () => {
    expect(DEFAULT_EXAM_HEADER.ministry).toContain('جمهورية العراق');
    expect(DEFAULT_EXAM_HEADER.directorate).toContain('المديرية العامة للتربية');
    expect(DEFAULT_EXAM_HEADER.subject).toBe('الرياضيات');
    expect(DEFAULT_EXAM_HEADER.grade).toBe('الرابع العلمي');
    expect(DEFAULT_EXAM_HEADER.totalMarks).toBe(100);
    expect(DEFAULT_EXAM_HEADER.showGradingGrid).toBe(true);
    expect(DEFAULT_EXAM_HEADER.gradingGridPosition).toBe('header');
  });

  it('maps all exam types to authentic Arabic ministerial labels', () => {
    expect(EXAM_TYPE_LABELS.midyear).toBe('امتحان نصف السنة');
    expect(EXAM_TYPE_LABELS.final_round_1).toBe('الامتحان النهائي - الدور الأول');
    expect(EXAM_TYPE_LABELS.final_round_2).toBe('الامتحان النهائي - الدور الثاني');
    expect(EXAM_TYPE_LABELS.monthly_1).toBe('امتحان الشهر الأول');
    expect(EXAM_TYPE_LABELS.mock).toBe('الامتحان الشامل التجريبي (الوزاري)');
  });

  it('formats page numbers correctly for footer in Eastern and Western styles', () => {
    const pageNum = 1;
    const totalPages = 2;
    expect(`صفحة ${formatDigits(pageNum, 'eastern')} من ${formatDigits(totalPages, 'eastern')}`)
      .toBe('صفحة ١ من ٢');
    expect(`صفحة ${formatDigits(pageNum, 'western')} من ${formatDigits(totalPages, 'western')}`)
      .toBe('صفحة 1 من 2');
  });

  it('persists and retrieves school profile in IndexedDB Dexie table', async () => {
    const testProfile: SchoolProfile = {
      id: 'test-school-1',
      ministry: 'جمهورية العراق - وزارة التربية',
      directorate: 'تربية الرصافة الأولى',
      schoolName: 'ثانوية العقيدة للبنات',
      logoPlacement: 'right',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await db.schoolProfiles.put(testProfile);
    const retrieved = await db.schoolProfiles.get('test-school-1');
    expect(retrieved).toBeDefined();
    expect(retrieved?.schoolName).toBe('ثانوية العقيدة للبنات');
    expect(retrieved?.logoPlacement).toBe('right');
  });
});
